const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
let forceDarkSVG: boolean | undefined

const getSpecificity = (selector: string): [number, number, number] => {
  let a = 0
  let b = 0
  let c = 0

  // 去掉 :where()，因为 :where() specificity 为 0
  selector = selector.replace(/:where\(([^()]*)\)/g, '')

  // ID
  a += (selector.match(/#[\w-]+/g) ?? []).length

  // class / attribute / pseudo-class
  b += (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?/g) ?? []).length

  // element / pseudo-element
  c += (selector.match(/(^|[\s>+~,(])(?:[a-zA-Z][\w-]*|\*)|::[\w-]+/g) ?? []).length

  return [a, b, c]
}

const compareSpecificity = (a: [number, number, number], b: [number, number, number]) => {
  if (a[0] !== b[0]) return a[0] - b[0]
  if (a[1] !== b[1]) return a[1] - b[1]
  return a[2] - b[2]
}

const getDeclaration = (
  rule: CSSStyleRule,
  property: string,
  order: number
): Declaration | null => {
  const value = rule.style.getPropertyValue(property)
  return !value
    ? null
    : {
        important: rule.style.getPropertyPriority(property) === 'important',
        specificity: getSpecificity(rule.selectorText),
        order,
        value,
      }
}

const getInlineDeclaration = (
  el: HTMLElement | SVGElement,
  property: string
): Declaration | null => {
  const value = el.style.getPropertyValue(property)
  if (!value) return null

  return {
    important: el.style.getPropertyPriority(property) === 'important',

    // inline style 的 specificity 高于普通 selector
    specificity: [Infinity, Infinity, Infinity],

    // inline style 不依赖 stylesheet 顺序
    order: Infinity,
    value,
  }
}

export const detectForceDarkSVG = () =>
  new Promise<boolean>((resolve) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const style = document.createElementNS(SVG_NAMESPACE, 'style')
    const rect = document.createElementNS(SVG_NAMESPACE, 'rect')

    svg.setAttribute('width', '8')
    svg.setAttribute('height', '8')

    svg.style.cssText = 'position:fixed;left:0;top:0;width:8px;height:8px;pointer-events:none'
    style.textContent = `
      rect {
        fill: #8968e6;
        stroke: #8968e6;
      }
    `

    rect.setAttribute('width', '8')
    rect.setAttribute('height', '8')

    svg.append(style, rect)
    document.body?.appendChild(svg)

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const cs = getComputedStyle(rect)
        const dark = cs.fill !== 'rgb(137, 104, 230)' || cs.stroke !== 'rgb(137, 104, 230)'

        svg.remove()
        resolve(dark)
      })
    )
  })

const shouldReplace = (current: Declaration | undefined, next: Declaration) => {
  if (!current) return true

  // !important 优先
  if (current.important !== next.important) {
    return next.important
  }

  // specificity 高的优先
  const specificity = compareSpecificity(current.specificity, next.specificity)
  if (specificity !== 0) {
    return specificity < 0
  }

  // specificity 相同，后面的规则优先
  return next.order >= current.order
}

const getAttributeDeclaration = (
  el: SVGElement,
  property: 'fill' | 'stroke'
): Declaration | null => {
  const value = el.getAttribute(property)

  if (!value) return null

  return {
    important: false,
    specificity: [0, 0, 0],
    order: Infinity,
    value,
  }
}

export const detectForceDark = () =>
  new Promise<boolean>((resolve) => {
    const el = document.createElement('div')
    el.style.cssText =
      'position:fixed;left:0;top:0;width:8px;height:8px;background-color:#fff;color:#000;pointer-events:none'
    document.body?.appendChild(el)
    // 两帧后读：引擎处理动态插入的元素需要时间
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const cs = getComputedStyle(el)
        const dark = cs.backgroundColor !== 'rgb(255, 255, 255)' || cs.color !== 'rgb(0, 0, 0)'
        el.remove()
        resolve(dark)
      })
    )
  })

export const isSVGElement = (elem: Element): elem is SVGElement =>
  (typeof SVGElement !== 'undefined' && elem instanceof SVGElement) ||
  elem.namespaceURI === SVG_NAMESPACE

const isNodeElement = (elem: Element): elem is HTMLElement | SVGElement =>
  elem instanceof HTMLElement || isSVGElement(elem)

export const resetForceDarkSVG = () => {
  forceDarkSVG = undefined
}

export const isForceDarkSVG = async () => {
  if (forceDarkSVG === undefined) {
    forceDarkSVG = await Promise.all([detectForceDarkSVG(), detectForceDark()]).then(
      ([svg, theme]) => {
        return svg || theme
      }
    )
  }

  return Boolean(forceDarkSVG)
}

export const preventDarkReader = (elem: Element | null) => {
  if (!elem) return
  const issvg = isSVGElement(elem)
  const single = issvg && Boolean(elem.ownerSVGElement)

  // 所属 svg 根：只用于读取 stylesheet 规则，只有 svg 非根元素有 ownerSVGElement
  // attributes 分支传入的是子元素，style 在根上
  const svg = issvg ? (elem.ownerSVGElement ?? elem) : elem.querySelector('svg')
  if (!svg) return

  const style = svg.querySelector('style')
  let rules: CSSStyleRule[] = []

  if (style?.sheet) {
    try {
      rules = Array.from(style.sheet.cssRules).filter(
        (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule
      )
    } catch {
      // stylesheet 可能因为跨域等原因无法访问
    }
  }

  const elements = single
    ? [elem]
    : [
        svg,
        ...svg.querySelectorAll('rect, circle, ellipse, polygon, path, line, polyline, text, span'),
      ]

  elements.forEach((el) => {
    if (!isNodeElement(el)) return
    let fill: Declaration | undefined
    let stroke: Declaration | undefined
    let color: Declaration | undefined

    /*
     * 1. stylesheet
     */
    rules.forEach((rule, order) => {
      try {
        if (!el.matches(rule.selectorText)) return
      } catch {
        return
      }

      const ruleFill = getDeclaration(rule, 'fill', order)
      const ruleStroke = getDeclaration(rule, 'stroke', order)
      const ruleColor = getDeclaration(rule, 'color', order)

      if (ruleFill && shouldReplace(fill, ruleFill)) {
        fill = ruleFill
      }

      if (ruleStroke && shouldReplace(stroke, ruleStroke)) {
        stroke = ruleStroke
      }

      if (ruleColor && shouldReplace(color, ruleColor)) {
        color = ruleColor
      }
    })

    /*
     * 2. attribute
     */
    const attrFill = getAttributeDeclaration(el as SVGElement, 'fill')
    const attrStroke = getAttributeDeclaration(el as SVGElement, 'stroke')

    if (attrFill && shouldReplace(fill, attrFill)) {
      fill = attrFill
    }

    if (attrStroke && shouldReplace(stroke, attrStroke)) {
      stroke = attrStroke
    }

    /*
     * 3. inline style
     *
     * inline style 本身就是最高 specificity。
     */
    const inlineFill = getInlineDeclaration(el, 'fill')
    const inlineStroke = getInlineDeclaration(el, 'stroke')
    const inlineColor = getInlineDeclaration(el, 'color')

    if (inlineFill && shouldReplace(fill, inlineFill)) {
      fill = inlineFill
    }

    if (inlineStroke && shouldReplace(stroke, inlineStroke)) {
      stroke = inlineStroke
    }

    if (inlineColor && shouldReplace(color, inlineColor)) {
      color = inlineColor
    }

    /*
     * 4. DarkReader inline 标记
     *
     * 如果存在：
     *
     *   --darkreader-inline-fill
     *
     * 那么当前 fill 就是 QQ/DarkReader 修改后的
     * inline 属性。
     *
     * 我们需要把原来的 fill 锁成 !important。
     */
    const hasDarkReaderFill = el.style.getPropertyValue('--darkreader-inline-fill')

    const hasDarkReaderStroke = el.style.getPropertyValue('--darkreader-inline-stroke')

    if (
      hasDarkReaderFill &&
      el.style.getPropertyValue('fill') &&
      el.style.getPropertyPriority('fill') !== 'important'
    ) {
      el.style.setProperty('fill', el.style.getPropertyValue('fill'), 'important')
    }

    if (
      hasDarkReaderStroke &&
      el.style.getPropertyValue('stroke') &&
      el.style.getPropertyPriority('stroke') !== 'important'
    ) {
      el.style.setProperty('stroke', el.style.getPropertyValue('stroke'), 'important')
    }

    /*
     * 5. 锁定最终 CSS declaration
     */
    if (fill && el.style.getPropertyPriority('fill') !== 'important') {
      el.style.setProperty('fill', fill.value, 'important')
    }

    if (stroke && el.style.getPropertyPriority('stroke') !== 'important') {
      el.style.setProperty('stroke', stroke.value, 'important')
    }

    if (color && el.style.getPropertyPriority('color') !== 'important') {
      el.style.setProperty('color', color.value, 'important')
    }
  })
}

type Declaration = {
  important: boolean
  order: number
  specificity: [number, number, number]
  value: string
}

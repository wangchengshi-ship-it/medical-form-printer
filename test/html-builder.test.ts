/**
 * @fileoverview HTML 构建器测试
 * @module test/html-builder
 */

import { describe, it, expect } from 'vitest'
import {
  h,
  HtmlBuilder,
  escapeHtml,
  escapeAttr,
  fragment,
  when,
  each,
  div,
  span,
  table,
  tr,
  td,
  th,
} from '../src/utils/html-builder'

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's fine")).toBe('It&#039;s fine')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should handle string with no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})

describe('escapeAttr', () => {
  it('should escape double quotes', () => {
    expect(escapeAttr('value with "quotes"')).toBe('value with &quot;quotes&quot;')
  })

  it('should escape ampersand', () => {
    expect(escapeAttr('a & b')).toBe('a &amp; b')
  })

  it('should handle empty string', () => {
    expect(escapeAttr('')).toBe('')
  })
})

describe('HtmlBuilder', () => {
  describe('basic element creation', () => {
    it('should create simple element', () => {
      expect(h('div').build()).toBe('<div></div>')
    })

    it('should create element with text content', () => {
      expect(h('p').text('Hello').build()).toBe('<p>Hello</p>')
    })

    it('should escape text content', () => {
      expect(h('p').text('<script>').build()).toBe('<p>&lt;script&gt;</p>')
    })

    it('should create void element', () => {
      expect(h('br').build()).toBe('<br />')
      expect(h('img').attr('src', 'test.png').build()).toBe('<img src="test.png" />')
    })
  })

  describe('attributes', () => {
    it('should set single attribute', () => {
      expect(h('input').attr('type', 'text').build()).toBe('<input type="text" />')
    })

    it('should set multiple attributes', () => {
      const html = h('input').attrs({ type: 'text', name: 'username' }).build()
      expect(html).toContain('type="text"')
      expect(html).toContain('name="username"')
    })

    it('should handle boolean attribute (true)', () => {
      expect(h('input').attr('disabled', true).build()).toBe('<input disabled />')
    })

    it('should skip attribute when value is false', () => {
      expect(h('input').attr('disabled', false).build()).toBe('<input />')
    })

    it('should skip attribute when value is undefined', () => {
      expect(h('input').attr('value', undefined).build()).toBe('<input />')
    })

    it('should skip attribute when value is null', () => {
      expect(h('input').attr('value', null).build()).toBe('<input />')
    })

    it('should escape attribute values', () => {
      expect(h('div').attr('data-value', 'a "b" c').build()).toBe(
        '<div data-value="a &quot;b&quot; c"></div>'
      )
    })
  })

  describe('class', () => {
    it('should set single class', () => {
      expect(h('div').class('container').build()).toBe('<div class="container"></div>')
    })

    it('should set multiple classes', () => {
      expect(h('div').class('foo', 'bar').build()).toBe('<div class="foo bar"></div>')
    })

    it('should handle space-separated classes', () => {
      expect(h('div').class('foo bar baz').build()).toBe('<div class="foo bar baz"></div>')
    })

    it('should skip falsy class values', () => {
      expect(h('div').class('foo', undefined, null, false, 'bar').build()).toBe(
        '<div class="foo bar"></div>'
      )
    })
  })

  describe('id', () => {
    it('should set id attribute', () => {
      expect(h('div').id('main').build()).toBe('<div id="main"></div>')
    })
  })

  describe('style', () => {
    it('should set single style', () => {
      expect(h('div').style('color', 'red').build()).toBe('<div style="color: red"></div>')
    })

    it('should set multiple styles', () => {
      const html = h('div').style('color', 'red').style('font-size', '14px').build()
      expect(html).toBe('<div style="color: red; font-size: 14px"></div>')
    })

    it('should set styles via css method', () => {
      const html = h('div').css({ color: 'red', 'font-size': '14px' }).build()
      expect(html).toBe('<div style="color: red; font-size: 14px"></div>')
    })

    it('should skip undefined style values', () => {
      expect(h('div').style('color', undefined).build()).toBe('<div></div>')
    })

    it('should skip null style values', () => {
      expect(h('div').style('color', null).build()).toBe('<div></div>')
    })

    it('should skip empty string style values', () => {
      expect(h('div').style('color', '').build()).toBe('<div></div>')
    })
  })

  describe('children', () => {
    it('should add child element', () => {
      expect(h('div').child(h('span').text('Hello')).build()).toBe(
        '<div><span>Hello</span></div>'
      )
    })

    it('should add multiple children', () => {
      expect(
        h('div')
          .child(h('span').text('A'), h('span').text('B'))
          .build()
      ).toBe('<div><span>A</span><span>B</span></div>')
    })

    it('should add string child (not escaped)', () => {
      expect(h('div').child('Hello').build()).toBe('<div>Hello</div>')
    })

    it('should skip undefined children', () => {
      expect(h('div').child(undefined).build()).toBe('<div></div>')
    })

    it('should skip null children', () => {
      expect(h('div').child(null).build()).toBe('<div></div>')
    })

    it('should skip false children', () => {
      expect(h('div').child(false).build()).toBe('<div></div>')
    })
  })

  describe('raw', () => {
    it('should add raw HTML without escaping', () => {
      expect(h('div').raw('<b>Bold</b>').build()).toBe('<div><b>Bold</b></div>')
    })
  })

  describe('when', () => {
    it('should execute builder when condition is true', () => {
      expect(
        h('div')
          .when(true, (b) => b.class('active'))
          .build()
      ).toBe('<div class="active"></div>')
    })

    it('should not execute builder when condition is false', () => {
      expect(
        h('div')
          .when(false, (b) => b.class('active'))
          .build()
      ).toBe('<div></div>')
    })
  })

  describe('toString', () => {
    it('should return same result as build', () => {
      const builder = h('div').class('test').text('Hello')
      expect(builder.toString()).toBe(builder.build())
    })
  })

  describe('complex nesting', () => {
    it('should handle deeply nested elements', () => {
      const html = h('table')
        .class('data-table')
        .child(
          h('thead').child(
            h('tr').child(h('th').text('Name'), h('th').text('Age'))
          ),
          h('tbody').child(
            h('tr').child(h('td').text('Alice'), h('td').text('30')),
            h('tr').child(h('td').text('Bob'), h('td').text('25'))
          )
        )
        .build()

      expect(html).toContain('<table class="data-table">')
      expect(html).toContain('<thead>')
      expect(html).toContain('<th>Name</th>')
      expect(html).toContain('<td>Alice</td>')
      expect(html).toContain('</table>')
    })
  })
})

describe('fragment', () => {
  it('should join multiple elements', () => {
    expect(fragment(h('span').text('A'), h('span').text('B'))).toBe(
      '<span>A</span><span>B</span>'
    )
  })

  it('should handle strings', () => {
    expect(fragment('Hello', ' ', 'World')).toBe('Hello World')
  })

  it('should skip falsy values', () => {
    expect(fragment(h('span').text('A'), undefined, null, false, h('span').text('B'))).toBe(
      '<span>A</span><span>B</span>'
    )
  })
})

describe('when helper', () => {
  it('should return content when condition is true', () => {
    expect(when(true, h('span').text('Yes'))).toBe('<span>Yes</span>')
  })

  it('should return empty string when condition is false', () => {
    expect(when(false, h('span').text('Yes'))).toBe('')
  })

  it('should return fallback when condition is false', () => {
    expect(when(false, h('span').text('Yes'), h('span').text('No'))).toBe('<span>No</span>')
  })

  it('should handle function content', () => {
    expect(when(true, () => h('span').text('Lazy'))).toBe('<span>Lazy</span>')
  })

  it('should handle string content', () => {
    expect(when(true, 'Hello')).toBe('Hello')
  })
})

describe('each helper', () => {
  it('should render array items', () => {
    const items = ['A', 'B', 'C']
    expect(each(items, (item) => h('li').text(item))).toBe(
      '<li>A</li><li>B</li><li>C</li>'
    )
  })

  it('should provide index', () => {
    const items = ['A', 'B']
    expect(each(items, (item, i) => h('li').text(`${i}: ${item}`))).toBe(
      '<li>0: A</li><li>1: B</li>'
    )
  })

  it('should handle empty array', () => {
    expect(each([], (item) => h('li').text(item))).toBe('')
  })

  it('should handle undefined', () => {
    expect(each(undefined, (item) => h('li').text(item))).toBe('')
  })

  it('should handle null', () => {
    expect(each(null, (item) => h('li').text(item))).toBe('')
  })

  it('should skip falsy render results', () => {
    const items = [1, 2, 3]
    expect(
      each(items, (item) => (item % 2 === 0 ? h('li').text(String(item)) : false))
    ).toBe('<li>2</li>')
  })
})

describe('shortcut functions', () => {
  it('div should create div element', () => {
    expect(div().class('test').build()).toBe('<div class="test"></div>')
  })

  it('span should create span element', () => {
    expect(span().text('text').build()).toBe('<span>text</span>')
  })

  it('table should create table element', () => {
    expect(table().build()).toBe('<table></table>')
  })

  it('tr should create tr element', () => {
    expect(tr().build()).toBe('<tr></tr>')
  })

  it('td should create td element', () => {
    expect(td().text('cell').build()).toBe('<td>cell</td>')
  })

  it('th should create th element', () => {
    expect(th().text('header').build()).toBe('<th>header</th>')
  })
})

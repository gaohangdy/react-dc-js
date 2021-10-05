import { BaseMixin } from '@gaohangdy/dc'
import * as d3 from 'd3'
import cloud from 'd3-cloud'

export class WordcloudChart extends BaseMixin {
  constructor(parent, chartGroup) {
    super()

    this._cloud = null
    this._g = null
    this._padding = 5
    this._font = 'Impact'
    this._relativeSize = 10
    this._minX = 0
    this._minY = 0
    this._fill = d3.scaleOrdinal(d3.schemeCategory10) //d3.scale.category20();

    var titleFunction = function (d) {
      return this.title()(d)
    }

    this.anchor(parent, chartGroup)
  }

  _doRender() {
    this.on('postRender', function () {
      this.apply()
    })
    this.drawWordCloud()

    return this._doRedraw()
  }

  initializeSvg() {
    this.select('svg').remove()

    this._g = d3
      .select(this.anchor())
      .append('svg')
      .attr('height', this.height())
      .attr('width', this.width())
      .append('g')
      //.on('click', this.onClick)
      .attr('cursor', 'pointer')
  }

  drawWordCloud() {
    this.initializeSvg()

    var groups = this._computeOrderedGroups(this.data()).filter(function (d) {
      return this.valueAccessor()(d) !== 0
    })

    var data = groups.map(function (d) {
      var value = this.valueAccessor()(d)
      var key = this.keyAccessor()(d)
      var title = this.title()(d)
      var result = {
        text: d.key,
        size: this.checkSize(d),
        value: value,
        key: key,
        title: title,
      }

      return result
    })

    this._cloud = cloud().size([this.width(), this.height()])

    this._cloud
      .words(data)
      .padding(this.padding())
      .rotate(function () {
        return ~~(Math.random() * 2) * 90
      })
      .font(this.font())
      .fontSize(function (d) {
        return d.size
      })
      .on('end', this.draw)

    this._cloud.start()
  }

  _doRedraw = function () {
    this.on('postRedraw', function () {
      this.apply()
    })

    this.drawWordCloud()
  }

  apply = function () {
    d3.select(this.anchor())
      .select('svg')
      .attr(
        'viewBox',
        this.minX() +
          ' ' +
          this.minY() +
          ' ' +
          this.width() +
          ' ' +
          this.height()
      )
  }

  checkSize(d) {
    var x = 0
    if (d.value <= 0) {
      x = 0
    } else {
      x = Math.log(d.value) * this.relativeSize()
    }

    return x
  }

  draw(words) {
    this._g
      .attr('width', this.width())
      .attr('height', this.height())
      .attr('transform', 'translate(150,150)')
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', function (d) {
        return d.size + 'px'
      })
      .style('font-family', this.font())
      .style('fill', function (d, i) {
        return this._fill(i)
      })
      .attr('text-anchor', 'middle')
      .attr('transform', function (d) {
        return 'translate(' + [d.x, d.y] + ')'
      })
      .text(function (d) {
        return d.text
      })
      .append('title')
      .text(function (d) {
        return d.title
      })
  }

  minX = function (_) {
    if (!arguments.length) {
      return this._minX
    }

    this._minX = _
    return this
  }

  minY = function (_) {
    if (!arguments.length) {
      return this._minY
    }

    this._minY = _
    return this
  }

  padding = function (_) {
    if (!arguments.length) {
      return this._padding
    }

    this._padding = _
    return this
  }

  font = function (_) {
    if (!arguments.length) {
      return this._font
    }

    this._font = _
    return this
  }

  coordinateAccessor = function (_) {
    if (!arguments.length) {
      return this._coordinate
    }

    this._coordinate = _
    return this
  }

  radiusAccessor = function (_) {
    if (!arguments.length) {
      return this._radiusAccessor
    }

    this._radiusAccessor = _
    return this
  }

  relativeSize = function (_) {
    if (!arguments.length) {
      return this._relativeSize
    }

    this._relativeSize = _
    return this
  }
}

export const wordcloudChart = (parent, chartGroup) =>
  new WordcloudChart(parent, chartGroup)

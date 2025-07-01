export default {
  install(app) {
    app.directive('dialogDrag', {
      mounted(el) {
        const dialogHeaderEl = el.querySelector('.el-dialog__header')
        const dragDom = el.querySelector('.el-dialog')
        if (!dialogHeaderEl || !dragDom) return
        dialogHeaderEl.style.cursor = 'move'
        const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
        dialogHeaderEl.onmousedown = e => {
          const disX = e.clientX - dialogHeaderEl.offsetLeft
          const disY = e.clientY - dialogHeaderEl.offsetTop
          const screenWidth = document.body.clientWidth
          const screenHeight = document.documentElement.clientHeight
          const dragDomWidth = dragDom.offsetWidth
          const dragDomHeight = dragDom.offsetHeight
          const minLeft = dragDom.offsetLeft
          const maxLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
          const minTop = dragDom.offsetTop
          const maxTop = screenHeight - dragDom.offsetTop - dragDomHeight
          let styL, styT
          if (sty.left.includes('%')) {
            styL = +document.body.clientWidth * (+sty.left.replace(/%/g, '') / 100)
            styT = +document.body.clientHeight * (+sty.top.replace(/%/g, '') / 100)
          } else {
            styL = +sty.left.replace(/px/g, '')
            styT = +sty.top.replace(/px/g, '')
          }
          document.onmousemove = function (e) {
            let l = e.clientX - disX
            let t = e.clientY - disY
            if (-l > minLeft) {
              l = -minLeft
            } else if (l > maxLeft) {
              l = maxLeft
            }
            if (-t > minTop) {
              t = -minTop
            } else if (t > maxTop) {
              t = maxTop
            }
            dragDom.style.left = `${l + styL}px`
            dragDom.style.top = `${t + styT}px`
          }
          document.onmouseup = function () {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    })
  }
}

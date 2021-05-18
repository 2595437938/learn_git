function getStyle(element) {
    if (!element.style)
        element.style = {};


    for (let prop in element.computedStyle) {

        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;



        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
        if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

function layout(element) {

    if (!element.computedStyle)
        return;

    var elementStyle = getStyle(element);

    if (elementStyle.display !== 'flex')
        return;

    var items = element.children.filter(e => e.type === 'element');

    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    var style = elementStyle;


    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })


    if (!style.flexDirection || style.flexDirection === 'auto')
        style.flexDirection = 'row';
    if (!style.alignItems || style.alignItems === 'auto')
        style.alignItems = 'stretch';
    if (!style.justifyContent || style.justifyContent === 'auto')
        style.justifyContent = 'flex-start';
    if (!style.flexWrap || style.flexWrap === 'auto')
        style.flexWrap = 'nowrap';
    if (!style.alignContent || style.alignContent === 'auto')
        style.alignContent = 'stretch';

    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        corssSize, corssStart, corssEnd, corssSign, corssBase
    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        corssSize = 'height';
        corssStart = 'top';
        corssEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        corssSize = 'height';
        corssStart = 'top';
        corssEnd = 'bottom';
    }
    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        corssSize = 'width';
        corssStart = 'left';
        corssEnd = 'right';
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        corssSize = 'width';
        corssStart = 'left';
        corssEnd = 'right';
    }
    if (style.flexWrap === 'wrap-reverse') {
        var tmp = corssStart;
        corssStart = corssEnd;
        corssEnd = tmp;
        corssSign = -1;
    } else {
        corssBase = 0;
        corssSign = 1;
    }


    var isAutoMainSize = false;
    if (!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0))
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
        }
        isAutoMainSize = true;

    }




    var flexLine = [];
    var flexLines = [flexLine];

    var mainSpace = elementStyle[mainSize];
    var corssSpace = 0;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }
        if (itemStyle.flex) {
            flexLine.push(item);
        } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[corssSize] !== null && itemStyle[corssSize] !== (void 0))
                corssSpace = Math.max(corssSpace, itemStyle[corssSize]);
            flexLine.push(item);
        } else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.corssSpace = corssSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                corssSpace = 0;
            } else {
                flexLine.push(item);
            }
            if (itemStyle[corssSize] !== null && itemStyle[corssSize] !== (void 0))
                corssSpace = math.max(corssSpace, itemStyle[corssSize]);
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;

    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.corssSpace = (style[corssSize] !== undefined) ? style[corssSize] : corssSpace;
    } else {
        flexLine.corssSpace = corssSpace;
    }

    if (mainSpace < 0) {

        var scale = style[mainSpace] / (style[mainSize] - mainSpace);
        var currentMain = mainBase;
        for (var i = 0; i < item.length; i++) {
            var item = items[i];
            var itemStyle = getstyle(item);

            if (itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }

    } else {

        flexLine.forEach(function (items) {

            var mainSpace = items.mainSpace;
            var flexTotal = 0;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemStyle = getStyle(item);

                if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }

            if (flexTotal > 0) {

                var currentMain = mainBase;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainspace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            } else {

                if (style.justifyContent === 'flex-start') {
                    var currentMain = mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'flex-end') {
                    var currentMain = mainSpace * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'center') {
                    var currentMain = mainSpace / 2 * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent === 'space-between') {
                    var step = mainSpace / (items.length - 1) * mainSign;
                    var currentMain = mainBase;
                }
                if (style.justifyContent === 'space-around') {
                    var step = mainspace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    itemStyle[mainStart, currentMain];
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] * step;
                }
            }
        })


    }






    var corssSpace;

    if (!style[corssSize]) {
        corssSpace = 0;
        elementStyle[corssSize] = 0;
        for (var i = 0; i < flexLines.length; i++) {
            elementStyle[corssSize] = elementStyle[corssSpace] + flexLines[i].corssSpace;
        }
    } else {
        corssSpace = style[corssSize];
        for (var i = 0; i < flexLines.length; i++) {
            corssSpace -= flexLines[i].corssSpace;
        }
    }


    if (style.flexWrap === 'wrap-reverse') {
        corssBase = style[corssSize];
    } else {
        corssBase = 0;
    }
    var linesize = style[corssSize] / flexLines.length;

    var step;
    if (style.alignContent === 'flex-start') {
        corssBase += 0;
        step = 0;
    }
    if (style.alignContent === 'flex-end') {
        corssBase += corssSign * corssSpace;
        step = 0;
    }
    if (style.alignContent === 'center') {
        corssBase += corssSign * corssSpace / 2;
        step = 0;
    }
    if (style.alignContent === 'space-between') {
        corssBase += 0;
        step = corssSpace / (flexLines.length - 1);
    }
    if (style.alignContent === 'space-around') {

        step = corssSpace / (flexLines.length)
        corssBase += corssSign * step / 2;
    }
    if (style.alignContent === 'stretch') {
        corssBase += 0;
        step = 0;
    }
    flexLines.forEach(function (items) {
        var lineCorssSize = style.alignContent === 'stretch' ?
            items.corssSpace + corssSpace / flexLines.length :
            items.corssSpace;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemStyle = getStyle(item);

            var align = itemStyle.alignSelf || style.alignItems;

            if (item === null)
                itemStyle[corssSize] = (align === 'stretch') ?
                    lineCorssSize : 0

            if (align === 'flex-start') {
                itemStyle[corssStart] = corssBase;
                itemStyle[corssEnd] = itemStyle[corssStart] + corssSign * itemStyle[corssSize];
            }

            if (align === 'flex-end') {
                itemStyle[corssEnd] = corssBase + corssSign * lineCorssSize;
                itemStyle[corssStart] = itemStyle[corssEnd] - corssSign * itemStyle[corssSize]
            }

            if (align === 'center') {
                itemStyle[corssStart] = corssBase + corssSign * (lineCorssSize - itemitemStyle[corssSize]) / 2;
                itemStyle[corssEnd] = itemStyle[corssStart] + corssSign * itemStyle[corssSize];
            }

            if (align === 'stretch') {
                itemStyle[corssStart] = corssBase;
                itemStyle[corssEnd] = corssBase + corssSign * ((itemStyle[corssSize] !== null && itemStyle[corssSize] !== (void 0)) ?
                    itemStyle[corssSize] : lineCorssSize)

                itemStyle[corssSize] = corssSign * (itemStyle[corssEnd] - itemStyle[corssStart])
            }
        }
        corssBase += corssSign * (lineCorssSize + step);
    });
    console.log(items);
}


module.exports = layout;
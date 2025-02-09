import { elements } from '../elements.js';

export const resizeH = ({
    leftInc = 0,
    left = elements.boxLeft,
    right = elements.boxRight,
    minLeft = 500,
    minRight = 500,
} = {}) => {
    const leftWidth = left.getBoundingClientRect().width;
    const rightWidth = right.getBoundingClientRect().width;

    const newLeftWidth = leftWidth + leftInc;
    const newRightWidth = rightWidth - leftInc;

    if (
        newLeftWidth <= minLeft && newLeftWidth <= leftWidth ||
        newRightWidth <= minRight && newRightWidth <= rightWidth
    ) {
        return;
    }

    left.style.width = `${newLeftWidth}px`;
    right.style.width = `${newRightWidth}px`;
}

export const resizeV = ({
    topInc = 0,
    top = elements.boxRequest,
    bottom = elements.boxHistory,
    minTop = 150,
    minBottom = 150,
} = {}) => {
    const topHeight = top.getBoundingClientRect().height;
    const bottomHeight = bottom.getBoundingClientRect().height;

    const newTopHeight = topHeight + topInc;
    const newBottomHeight = bottomHeight - topInc;

    if (
        newTopHeight <= minTop && newTopHeight <= topHeight ||
        newBottomHeight <= minBottom && newBottomHeight <= bottomHeight
    ) {
        return;
    }

    top.style.height = `${newTopHeight}px`;
    bottom.style.height = `${newBottomHeight}px`;
};

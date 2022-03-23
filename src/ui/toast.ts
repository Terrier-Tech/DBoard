

export type ToastType = "secondary" | "alert"


/**
 * Shows a temporary toast message at the bottom of the screen.
 * @param msg the message
 * @param type controls the color
 */
export function showToast(msg: string, type: ToastType="secondary") {
    const elem = document.createElement('div')
    elem.classList.add('toast')
    elem.classList.add(type)
    elem.innerHTML = msg
    document.getElementById('toasts')?.appendChild(elem)
    delayAddClass(elem, 'show')
    setTimeout(
        () => {
            elem.classList.remove('show')
            delayRemoveElement(elem)
        }, 2000
    )
}

/**
 * Adds a class to an element after a small delay so that the DOM can render.
 */
function delayAddClass(elem: HTMLElement, className: string) {
    setTimeout(
        () => {
            elem.classList.add(className)
        }, 10
    )
}

/** 
 * Removes an element from the DOM after a delay.
 */
function delayRemoveElement(elem: HTMLElement, delay: number=1000) {
    setTimeout(
        () => {
            elem.remove()
        },
        delay
    )
}
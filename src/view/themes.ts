
enum ColorName {
    blue="blue",
    green="green",
    purple="purple",
    cyan="cyan",
    magenta="magenta",
    gray="gray",
    orange="orange",
    red="red",
    yellow="yellow"
}

class Theme {
    readonly colors: Record<ColorName,string> = {
        blue: '#2980b9',
        green: '#27ae60',
        purple: '#8e44ad',
        cyan: '#079992',
        magenta: '#f368e0',
        gray: '#bdc3c7',
        orange: '#f39c12',
        red: '#c0392b',
        yellow: '#f1c40f'
    }

    color(name: ColorName) : string {
        return this.colors[name]
    }

    fgColor = '#333333'
    oddBgColor = '#f8f8f8'
    evenBgColor = '#ffffff'
    hintFgColor = '#aaa'
    hintBgColor = '#eee'
}

const LightTheme = new Theme()

export {Theme as Base}
export {LightTheme as Light}
export {ColorName}
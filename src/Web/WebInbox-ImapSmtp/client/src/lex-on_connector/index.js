import React from 'react'
import ReactDOM from 'react-dom'
import singleSpaReact from 'single-spa-react'
import main from './main'


const domElementGetter = () => {   
    let el = document.getElementById('lexon-app-dev')
  if (!el) {
    el = document.createElement('div')
      el.id = 'lexon-app-dev'
    document.body.appendChild(el)
  }

  return el
}

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: main,
  domElementGetter,
})

export const bootstrap = props => reactLifecycles.bootstrap(props)

export const mount = props => reactLifecycles.mount(props)

export const unmount = props => reactLifecycles.unmount(props)

import * as React from 'react'
import { useState, cloneElement } from 'react'
import { useControl } from 'react-map-gl'
import { createPortal } from 'react-dom'

import type { MapboxMap, IControl } from 'react-map-gl'

class OverlayControl implements IControl {
  _map: MapboxMap | null = null
  _container: HTMLElement | undefined
  _redraw: () => void

  constructor(redraw: () => void) {
    this._redraw = redraw
  }

  onAdd(map: MapboxMap) {
    this._map = map
    map.on('move', this._redraw)

    this._container = document.createElement('div')
    this._redraw()
    return this._container
  }

  onRemove() {
    this._container?.remove()
    this._map?.off('move', this._redraw)
    this._map = null
  }

  getMap() {
    return this._map
  }

  getElement() {
    return this._container
  }
}

function CustomOverlay(props: { children: React.ReactElement }) {
  const [, setVersion] = useState(0)

  const ctrl = useControl<OverlayControl>(() => {
    const forceUpdate = () => setVersion((v) => v + 1)
    return new OverlayControl(forceUpdate)
  })

  const map = ctrl.getMap()

  return (
    map &&
    createPortal(cloneElement(props.children, { map }), ctrl.getElement())
  )
}

export default React.memo(CustomOverlay)

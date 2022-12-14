import { useCallback, useEffect, useMemo } from 'react'
import { Source, Layer } from 'react-map-gl'

import useMultiPolygonLayer from '../../hooks/useMultiPolygonLayer'
import { useThemeContext } from '../../contexts/ThemeContext'
import useHoverFeature from '../../hooks/useHoverFeature'
import { useFeatureFlagContext } from '../../contexts/FeatureFlagContext'
import { SHOW_REGIONS } from '../../config/featureFlags'

import { regionLayerStyle, highlightRegionLayerStyle } from './layerStyles'

const MAP_REGIONS_URL = import.meta.env.VITE_MAP_REGIONS_URL
const FEAT_PROPERTY_NAME = 'Name'

export type MapPluginComponentProps = { mapId: string }
export function RegionLayer({ mapId }: MapPluginComponentProps) {
  const [theme] = useThemeContext()
  const { mapLayerData } = useMultiPolygonLayer(MAP_REGIONS_URL)

  const {
    feature: hoverRegion,
    add,
    remove,
  } = useHoverFeature(mapId, 'regions')
  const hoverRegionName = hoverRegion?.properties?.[FEAT_PROPERTY_NAME] || ''
  const filter = useMemo(
    () => ['in', FEAT_PROPERTY_NAME, hoverRegionName],
    [hoverRegionName]
  )

  const [getValue] = useFeatureFlagContext(),
    flagShowRegions = getValue(SHOW_REGIONS)

  useEffect(() => {
    if (flagShowRegions) add()
    else remove()
  }, [add, flagShowRegions, remove])

  return (
    <Source type="geojson" data={mapLayerData}>
      <Layer
        {...regionLayerStyle({ theme })}
        id="regions"
        layout={{
          // FIXME layer is added before flag is on
          visibility: flagShowRegions && mapLayerData ? 'visible' : 'none',
        }}
      />
      <Layer
        {...highlightRegionLayerStyle({ theme })}
        source="regions"
        id="region-highlighted"
        filter={filter}
        layout={{
          visibility: flagShowRegions && mapLayerData ? 'visible' : 'none',
        }}
      />
    </Source>
  )
}

export const CustomControls = () => {
  const [getValue, replaceFlag] = useFeatureFlagContext()

  const onToggleBox = useCallback(() => {
    const cur = getValue(SHOW_REGIONS)
    replaceFlag(SHOW_REGIONS, !cur)
  }, [getValue, replaceFlag])

  return (
    <button
      style={{
        backgroundColor: getValue(SHOW_REGIONS) ? 'lightcyan' : 'lightgray',
      }}
      type="button"
      onClick={() => onToggleBox()}
    >
      Reg
    </button>
  )
}

export default RegionLayer

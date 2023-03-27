export const markerRefs: React.RefObject<L.Marker>[] = []
export const textMarkerTimeouts: NodeJS.Timeout[] = []

export const findMarker = (id: string) =>
  markerRefs.find(
    (m) =>
      m.current &&
      m.current.options &&
      m.current.options.icon &&
      m.current.options.icon.options &&
      m.current.options.icon.options.className &&
      m.current.options.icon.options.className.includes(`map-icon_${id}`),
  )

export const getChord = (progress: number) =>
  progress >= 8
    ? Math.floor((progress - 8 * Math.floor(progress / 8)) / 2)
    : Math.floor(progress / 2)

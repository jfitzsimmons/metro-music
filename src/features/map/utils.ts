export const markerRefs: React.RefObject<L.Marker>[] = []
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

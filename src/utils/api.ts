export const chooseEnvEndpoint = (): any =>
  process.env.REACT_APP_ENVIRONMENT === 'dev'
    ? fetch('/.netlify/functions/metro-updates').then((res) => res.json())
    : Math.random() > 0.2
    ? fetch(process.env.REACT_APP_EXT_BUS_API).then((res) => res.json())
    : fetch(process.env.REACT_APP_INT_BUS_API).then((res) => res.json())

export const chooseEnvEndpoint = (): any =>
  process.env.REACT_APP_ENVIRONMENT === 'dev'
    ? fetch('/.netlify/functions/metro-updates').then((res) => res.json())
    : fetch('https://stl-metro-api.vercel.app/busses/').then((res) =>
        res.json(),
      )

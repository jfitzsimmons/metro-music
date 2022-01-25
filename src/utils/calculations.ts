export function distance(lat1: number, lon1: number, lat2: number, lon2: number, /**unit*/) {
	if ((lat1 === lat2) && (lon1 === lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		return dist;
	}
}

export const orderBy = (arr: any[], props: any[], orders: { [x: string]: string; }) =>
[...arr].sort((a, b) =>
	props.reduce((acc, prop, i) => {
	if (acc === 0) {
		const [p1, p2] =
		orders && orders[i] === 'desc'
			? [b[prop], a[prop]]
			: [a[prop], b[prop]];
		acc = p1 > p2 ? 1 : p1 < p2 ? -1 : 0;
	}
	return acc;
	}, 0)
);

export const countBy = (arr: any[], fn: any) =>
  arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc:any, val:any) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

export const rndmRng = (h: number, l: number) => Math.random() * (h - l) + l;
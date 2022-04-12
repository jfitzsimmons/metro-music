import create from "zustand";
//import produce from "immer";
import { Bus } from "./models";


/***
 * 
 * MY BEST GUESs _ TEST JPF
 * loop through response
 * 
 * if id exists in old bus state (and timestamp is updated?) = patchBus
 * if id doesn't exist in old bus state = addBus
 * removeBus = TBD!!!
 * 
 */

import { Immutable, produce } from "immer"

type MetroState = {
    busses: Array<Bus>;
    addBus: Function;
    patchBus: Function;
};

export const useBussesStore = create<MetroState>((set) => ({
    busses: [
        {
            id: '-1',
            latitude: 38.627003,
            longitude: -90.199402,
            timestamp: '1649680408',
            label: "Welcome to our performance"
        },
    ],
    addBus: (payload: Bus) =>
        set(
            produce((draft) => {
                draft.busses.push(payload);
            })
        ),
    removeBus: (payload: string) =>
        set(
            produce((draft) => {
                const dramaIndex = draft.busses.findIndex((el: any) => el.id === payload);
                draft.busses.splice(dramaIndex, 1);
            })
        ),
    patchBus: (payload: Bus) =>
        set(
            produce((draft) => {
                let bus = draft.busses.find((el: Bus) => el.id === payload.id);
                bus = payload;
            })
        ),
}));

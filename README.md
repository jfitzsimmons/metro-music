# Music performed by St. Louis Metro Bus Drivers

Coded with React, Redux, Web Audio API, Leaflet + OpenStreetMap, gtfs-realtime-bindings

[![Metro Music Preview Image](https://github.com/jfitzsimmons/metro-music/blob/main/preview.png)](https://youtu.be/mdkzGyr0djg "St. Louis Metro Bus Drivers perform a IV-I-V-vi progression in A Major")
  
> **What?**  
> Using real-time data provided by [Metro St. Louis Developer Resources](https://www.metrostlouis.org/developer-resources/) music is created using the current movement of St. Louis's fleet of busses.
>  
> * Pitch - determined using the latitude of the bus.  Busses further north have a higher pitch, south lower.  
> * Panning — Busses further west will play more in your left ear,  east right.
> * Attack and Release — Busses moving at a quicker pace will play the note stocato (more abrupt), slower bussess will play with a crescendo (slow increase in volume).
 > * Duration — Busses that cover more distance will hold their notes longer.

## Acknowledgments
* inspired by [Digital fixation of audio processes](https://orchestra.stranno.su/)
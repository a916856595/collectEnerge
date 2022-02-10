import { coordinatesType, coordinateType } from '../declare/declare';

export const angleToPI = (angle: number): number => {
  return angle / 180 * Math.PI;
}

export const isCoordinateInRect = (coordinate: coordinateType, rect: coordinatesType): boolean => {
  return (
    coordinate[0] >= rect[0][0] &&
    coordinate[0] <= rect[1][0] &&
    coordinate[1] >= rect[0][1] &&
    coordinate[1] <= rect[1][1]
  )
}
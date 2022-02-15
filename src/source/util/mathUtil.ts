import { CoordinatesType, CoordinateType } from '../declare/declare';

export const angleToPI = (angle: number): number => (angle / 180) * Math.PI;

export const isCoordinateInRect = (coordinate: CoordinateType, rect: CoordinatesType): boolean => (
  coordinate[0] >= rect[0][0]
  && coordinate[0] <= rect[1][0]
  && coordinate[1] >= rect[0][1]
  && coordinate[1] <= rect[1][1]
);

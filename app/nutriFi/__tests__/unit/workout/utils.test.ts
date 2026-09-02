import { createVector, magnitude, Angle, GetAngle, Landmark } from "../../../utils/utils";

function makeLandmark(x: number, y: number, z = 0): Landmark {
  return { x, y, z, visibility: 1, presence: 1 };
}

describe('createVector', () => {
  it('returns the difference between two landmarks', () => {
    const a = makeLandmark(1, 2);
    const b = makeLandmark(4, 6);
    expect(createVector(a, b)).toEqual([3, 4]);
  });

  it('returns [0, 0] for identical landmarks', () => {
    const a = makeLandmark(5, 5);
    expect(createVector(a, a)).toEqual([0, 0]);
  });

  it('handles negative coordinates', () => {
    const a = makeLandmark(-1, -3);
    const b = makeLandmark(2, 1);
    expect(createVector(a, b)).toEqual([3, 4]);
  });
});

describe('magnitude', () => {
  it('computes the length of a 3-4-5 triangle', () => {
    expect(magnitude([3, 4])).toBe(5);
  });

  it('returns 0 for a zero vector', () => {
    expect(magnitude([0, 0])).toBe(0);
  });

  it('handles a unit vector', () => {
    expect(magnitude([1, 0])).toBe(1);
  });
});

describe('Angle', () => {
  it('returns 90 for perpendicular vectors', () => {
    expect(Angle([1, 0], [0, 1])).toBeCloseTo(90);
  });

  it('returns 0 for parallel vectors', () => {
    expect(Angle([1, 0], [2, 0])).toBeCloseTo(0);
  });

  it('returns 180 for opposite vectors', () => {
    expect(Angle([1, 0], [-1, 0])).toBeCloseTo(180);
  });

  it('returns 45 for a known 45-degree pair', () => {
    expect(Angle([1, 0], [1, 1])).toBeCloseTo(45);
  });
});

describe('GetAngle', () => {
  it('returns 90 for a right angle at the middle landmark', () => {
    const left  = makeLandmark(0, 1);
    const vertex = makeLandmark(0, 0);
    const right = makeLandmark(1, 0);
    expect(GetAngle(left, vertex, right)).toBeCloseTo(90);
  });

  it('returns 180 for a straight line', () => {
    const left  = makeLandmark(-1, 0);
    const vertex = makeLandmark(0, 0);
    const right = makeLandmark(1, 0);
    expect(GetAngle(left, vertex, right)).toBeCloseTo(180);
  });

  it('returns 0 when both arms point the same direction', () => {
    const a = makeLandmark(1, 0);
    const vertex = makeLandmark(0, 0);
    expect(GetAngle(a, vertex, a)).toBeCloseTo(0);
  });
});
export type TUint8Array = Uint8ClampedArray | Array<number>;
export type TUnaryFn<A, B> = (a: A) => B;
export type TPixel = [number, number, number];
export type TSource = string | HTMLImageElement | HTMLCanvasElement;
export type TRGBAColor = {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
};
export type TCurve = {
    readonly r: Uint8ClampedArray | Array<number>;
    readonly g: Uint8ClampedArray | Array<number>;
    readonly b: Uint8ClampedArray | Array<number>;
};
export type TEffect = {
    readonly curves: false | TCurve;
    readonly screen: false | TRGBAColor;
    readonly saturation: number;
    readonly vignette: number;
    readonly lighten: number;
    readonly viewfinder: false | string;
    readonly sepia: boolean;
    readonly gray: boolean;
    readonly brightness: number;
    readonly contrast: number;
};
export type TResult = {
    getDataURL(mimeType?: string, quality?: number): string;
    getCanvas(): HTMLCanvasElement;
    genImage(mimeType?: string, quality?: number): Promise<HTMLImageElement>;
};

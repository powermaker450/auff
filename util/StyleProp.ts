import { ComponentProps, JSX, JSXElementConstructor } from "react";

export type StyleProp<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = ComponentProps<T>["style"];

import { LocationFactoryOptions, LocationMethods } from "./types/locationFactory";
export default function locationFactory<Q>(options?: LocationFactoryOptions<Q>): LocationMethods<Q>;

import {
  PrepNavigateArgs,
  Preparer,
  PreppedNavigation
} from "./types/prepareNavigate";
import { ToArgument, NavType } from "./types/navigation";
import { Location } from "./types/location";

export default function prepareNavigate<Q>(
  args: PrepNavigateArgs<Q>
): Preparer<Q> {
  function prepReplace(location: Location<Q>): PreppedNavigation<Q> {
    const keyedLocation = args.locationUtils.keyed(
      location,
      args.keygen.minor(args.current().key)
    );
    return {
      action: "replace",
      finish: args.replace(keyedLocation),
      location: keyedLocation
    };
  }

  function prepPush(location: Location<Q>): PreppedNavigation<Q> {
    const keyedLocation = args.locationUtils.keyed(
      location,
      args.keygen.major(args.current().key)
    );
    return {
      action: "push",
      finish: args.push(keyedLocation),
      location: keyedLocation
    };
  }

  return function prep(to: ToArgument<Q>, navType: NavType) {
    const location = args.locationUtils.genericLocation(to);
    switch (navType) {
      case "anchor":
        return args.locationUtils.stringifyLocation(location) ===
          args.locationUtils.stringifyLocation(args.current())
          ? prepReplace(location)
          : prepPush(location);
      case "push":
        return prepPush(location);
      case "replace":
        return prepReplace(location);
      default:
        throw new Error(`Invalid navigation type: ${navType}`);
    }
  };
}

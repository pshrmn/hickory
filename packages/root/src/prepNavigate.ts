import {
  PrepNavigateArgs,
  Preparer,
  PreppedNavigation
} from "./types/prepNavigate";
import { ToArgument, NavType } from "./types/hickory";
import { Location } from "./types/location";

export default function prepNavigate<Q>(
  args: PrepNavigateArgs<Q>
): Preparer<Q> {
  function prepReplace(location: Location<Q>): PreppedNavigation<Q> {
    const keyedLocation = args.utils.keyed(
      location,
      args.utils.keygen.minor(args.current().key)
    );
    return {
      action: "replace",
      finish: args.replace(keyedLocation),
      location: keyedLocation
    };
  }

  function prepPush(location: Location<Q>): PreppedNavigation<Q> {
    const keyedLocation = args.utils.keyed(
      location,
      args.utils.keygen.major(args.current().key)
    );
    return {
      action: "push",
      finish: args.push(keyedLocation),
      location: keyedLocation
    };
  }

  return function prep(to: ToArgument<Q>, navType: NavType) {
    const location = args.utils.genericLocation(to);
    switch (navType) {
      case "anchor":
        return args.utils.stringifyLocation(location) ===
          args.utils.stringifyLocation(args.current())
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

export default function createKeyGenerator(initial) {
    var id = initial || 0;
    function parse(key) {
        return key
            .split('.')
            .map(function (value) { return parseInt(value, 10); });
    }
    return {
        keygen: {
            major: function (previous) {
                if (previous) {
                    var major = parse(previous)[0];
                    id = major + 1;
                }
                return id++ + ".0";
            },
            minor: function (current) {
                var _a = parse(current), major = _a[0], minor = _a[1];
                return major + "." + (minor + 1);
            },
            diff: function (first, second) {
                var firstMajor = parse(first)[0];
                var secondMajor = parse(second)[0];
                return secondMajor - firstMajor;
            }
        }
    };
}

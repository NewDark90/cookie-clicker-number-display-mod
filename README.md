# Exponent Display Mod

Adds many different options for formatting numbers in exponential notation.

Important Note: This mod is affected by the "Shorten Numbers" setting. Turning "Shorten Numbers" OFF will defer fully to the mod settings for displaying numbers.

## Formatting Options

### Normal
What the game normally does. Exponential format, 3 digit precision.

### Nine Precision
Exponential notation, but with 10 digit precision.

### Thousand Chunks (Default)
Displays within range of 1-1000, with 9 digits of precision. Thousands formatted like [n×000].

### Unshorten 
Forces the regular raw format with trailing zeros. May conflict with styling.

### Thousand Dots
Like "Unshorten", but 000 represented by •

### Custom (Advanced)
Gives you much more control by allowing you to plug in a javascript configuration based on Intl.NumberFormat. 
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

Set your language tag (BCP 47). Example: en-US.
Set a JSON object of the options for Intl.NumberFormat to leverage built in formatting features. Example: { "maximumFractionDigits": 1, "notation": "engineering" }


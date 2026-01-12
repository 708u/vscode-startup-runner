import { baseStyles } from "./base";
import { cardStyles } from "./card";
import { choicesStyles } from "./choices";
import { codeStyles } from "./code";
import { headerStyles } from "./header";
import { prismStyles } from "./prism";

export function getAllStyles(): string {
  return [
    baseStyles,
    cardStyles,
    headerStyles,
    codeStyles,
    prismStyles,
    choicesStyles,
  ].join("\n");
}

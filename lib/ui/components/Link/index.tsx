// lib/ui/components/Link/Link.tsx

import { LinkClient } from "./LinkClient";
import { AppLinkProps } from "./types";

export const Link = (props: AppLinkProps) => {
  return <LinkClient {...props} />;
};
import { ItemType } from "@/types";
import * as React from "react";
import { Deploy } from "@/features/deploy/Deploy";

export const mapTypeToCustomComponent = (type: ItemType, code?: string) => {
  switch (type) {
    case "deploy":
      return <Deploy code={code} />;
  }
};

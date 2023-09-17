import "@patternfly/react-core/dist/styles/base.css";
import { LogViewer, LogViewerSearch } from "@patternfly/react-log-viewer";
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Button,
  Checkbox,
} from "@patternfly/react-core";

import { useLogs } from "./hooks/useLogs.tsx";
import { useState } from "react";

export const BasicLogViewer = (props: { url: string }) => {
  const data = useLogs({ url: props.url });

  const [isTextWrapped, setIsTextWrapped] = useState(false);
  const onActionClick = (event: any) => {
    console.log("clicked test action button", event);
  };

  const onPrintClick = (event: any) => {
    console.log("clicked console print button", event);
  };

  return (
    <LogViewer
      data={data}
      isTextWrapped={isTextWrapped}
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button onClick={onActionClick} variant="control">
                Test Action
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <LogViewerSearch placeholder="Search" minSearchChars={3} />
            </ToolbarItem>
            <ToolbarItem>
              <Button onClick={onPrintClick} variant="control">
                Print to Console
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Checkbox
                label="Wrap text"
                aria-label="wrap text checkbox"
                isChecked={isTextWrapped}
                id="wrap-text-checkbox"
                onChange={() => setIsTextWrapped(!isTextWrapped)}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      }
    />
  );
};

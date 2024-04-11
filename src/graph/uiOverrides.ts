import {
  TLUiEventSource,
  TLUiOverrides,
  TLUiTranslationKey,
} from "@tldraw/tldraw";
import { useCollection } from "../../tldraw-collections/src/useCollection";

export const uiOverrides: TLUiOverrides = {
  actions(_editor, actions) {
    actions['toggle-graph-layout'] = {
      id: 'toggle-graph-layout',
      label: 'Toggle Graph Layout' as TLUiTranslationKey,
      readonlyOk: true,
      kbd: 'g',
      onSelect(_source: TLUiEventSource) {
        const event = new CustomEvent('toggleGraphLayoutEvent');
        window.dispatchEvent(event);
      },
    }
    return actions
  }
}
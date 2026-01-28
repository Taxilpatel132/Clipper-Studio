import { useEditorStore } from "../editor/store/editor.store";

export function useEditor() {
  return useEditorStore();
}
export { useEditorStore };
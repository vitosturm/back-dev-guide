import typescriptIcon from 'material-icon-theme/icons/typescript.svg?url'
import javascriptIcon from 'material-icon-theme/icons/javascript.svg?url'
import jsonIcon from 'material-icon-theme/icons/json.svg?url'
import folderBaseIcon from 'material-icon-theme/icons/folder-base.svg?url'
import folderSrcIcon from 'material-icon-theme/icons/folder-src.svg?url'
import folderUtilsIcon from 'material-icon-theme/icons/folder-utils.svg?url'
import type { WorkflowIconKey } from '@/data/workflows/types'

const ICONS: Record<WorkflowIconKey, string> = {
  typescript: typescriptIcon,
  javascript: javascriptIcon,
  json: jsonIcon,
  'folder-base': folderBaseIcon,
  'folder-src': folderSrcIcon,
  'folder-utils': folderUtilsIcon,
}

export function resolveIcon(key: WorkflowIconKey): string {
  return ICONS[key]
}

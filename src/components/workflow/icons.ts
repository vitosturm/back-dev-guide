import typescriptIcon from 'material-icon-theme/icons/typescript.svg?url'
import javascriptIcon from 'material-icon-theme/icons/javascript.svg?url'
import jsonIcon from 'material-icon-theme/icons/json.svg?url'
import folderBaseIcon from 'material-icon-theme/icons/folder-base.svg?url'
import folderSrcIcon from 'material-icon-theme/icons/folder-src.svg?url'
import folderUtilsIcon from 'material-icon-theme/icons/folder-utils.svg?url'
import nodejsIcon from 'material-icon-theme/icons/nodejs.svg?url'
import folderBaseOpenIcon from 'material-icon-theme/icons/folder-base-open.svg?url'
import folderDatabaseIcon from 'material-icon-theme/icons/folder-database.svg?url'
import consoleIcon from 'material-icon-theme/icons/console.svg?url'
import folderImagesIcon from 'material-icon-theme/icons/folder-images.svg?url'
import folderConfigIcon from 'material-icon-theme/icons/folder-config.svg?url'
import folderMiddlewareIcon from 'material-icon-theme/icons/folder-middleware.svg?url'
import folderRoutesIcon from 'material-icon-theme/icons/folder-routes.svg?url'
import folderControllerIcon from 'material-icon-theme/icons/folder-controller.svg?url'
import type { WorkflowIconKey } from '@/data/workflows/types'

const ICONS: Record<WorkflowIconKey, string> = {
  typescript: typescriptIcon,
  javascript: javascriptIcon,
  json: jsonIcon,
  'folder-base': folderBaseIcon,
  'folder-src': folderSrcIcon,
  'folder-utils': folderUtilsIcon,
  nodejs: nodejsIcon,
  'folder-base-open': folderBaseOpenIcon,
  'folder-database': folderDatabaseIcon,
  console: consoleIcon,
  'folder-images': folderImagesIcon,
  'folder-config': folderConfigIcon,
  'folder-middleware': folderMiddlewareIcon,
  'folder-routes': folderRoutesIcon,
  'folder-controller': folderControllerIcon,
}

export function resolveIcon(key: WorkflowIconKey): string {
  return ICONS[key]
}

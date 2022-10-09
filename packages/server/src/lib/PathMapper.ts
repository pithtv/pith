import {PathMappings} from "../settings/Settings";
import * as Path from "path";

export function mapPath(remotePath: string, mappings: PathMappings) : string {
  if(!mappings) {
    return remotePath;
  }
  const pathMapping = mappings.find(pm => remotePath.startsWith(pm.remotePath));
  if(pathMapping) {
    return Path.resolve(pathMapping.localPath, Path.relative(pathMapping.remotePath, remotePath));
  } else {
    return remotePath;
  }
}

import config from "./config.js";

export default preprocess = (path, { opts = {} }) => {
  path.hub.file.metadata.config = { ...config, ...opts };
};

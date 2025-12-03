declare interface Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

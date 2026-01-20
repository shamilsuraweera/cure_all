const OLD_NIC_REGEX = /^[0-9]{9}[vVxX]$/;
const NEW_NIC_REGEX = /^[0-9]{12}$/;

export const isValidNic = (value: string) =>
  OLD_NIC_REGEX.test(value) || NEW_NIC_REGEX.test(value);

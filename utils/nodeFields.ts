export type CreateNodeKind = "room" | "container" | "item";

export type NodeFormFields = {
  name: string;
  description: string;
  quantity: string;
  category: string;
  expiration_date: string;
  comment: string;
  tags: string;
};

export const CATEGORY_OPTIONS = [
  { label: "None", value: "" },
  { label: "Electronics", value: "electronics" },
  { label: "Tools", value: "tools" },
  { label: "Documents", value: "documents" },
  { label: "Clothing", value: "clothing" },
  { label: "Kitchen", value: "kitchen" },
];

export const EMPTY_NODE_FIELDS: NodeFormFields = {
  name: "",
  description: "",
  quantity: "1",
  category: "",
  expiration_date: "",
  comment: "",
  tags: "",
};

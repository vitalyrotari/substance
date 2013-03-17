var doc1 = {
  "commits": {},
  "id": "document:substance"
};

var doc1Commits = [
  {
    "op": [
      "insert",
      {
        "id": "heading:42c72d87e40f529dba27a9970c0a6ef3",
        "type": "heading",
        "data": {
          "content": "Why should I care?"
        }
      }
    ],
    "sha": "b0a4df43adba704eaef6809ada25bc4a"
  },
  {
    "op": [
      "insert",
      {
        "id": "text:cbf6ef358c308047e44081d8274a0ddb",
        "type": "text",
        "data": {
          "content": "Substance provides a flexible architecture, involving an extensible document format and protocol, collaborative features, an extensible editor as well as a digital hub for sharing documents."
        }
      }
    ],
    "sha": "46d783ce5341c6318199e1390a3c51ba",
    "parent": "b0a4df43adba704eaef6809ada25bc4a"
  },
  {
    "op": [
      "insert",
      {
        "id": "heading:9ff6e9be052283423f68296893009795",
        "type": "heading",
        "data": {
          "content": "Semantic Editing"
        }
      }
    ],
    "sha": "658ab4f39359c98a2289c5ba0187d9d4",
    "parent": "46d783ce5341c6318199e1390a3c51ba"
  },
  {
    "op": [
      "set",
      {
        "title": "Hello World"
      }
    ],
    "sha": "80895d15d6b6eca5733af79cc0f74b1b",
    "parent": "658ab4f39359c98a2289c5ba0187d9d4"
  }
];

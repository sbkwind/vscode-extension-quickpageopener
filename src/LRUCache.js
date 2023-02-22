/**
 * @typedef {Object} Node
 */
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * @typedef {Object} DoubleLinkedList
 */
class DoubleLinkedList {
  constructor() {
    this.head = new Node('head', 'head');
    this.tail = new Node('tail', 'tail');

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * 删除指定节点
   * @param {Node} node
   * @returns {Boolean}
   */
  remove(node) {
    if (this.head.next === this.tail) {
      return false;
    }
    const prev = node.prev;
    const next = node.next;

    next.prev = prev;
    node.prev = null;

    prev.next = next;
    node.next = null;

    return true;
  }

  /**
   * 在链表末尾增加节点
   * @param  {Node} node
   */
  addTail(node) {
    const prev = this.tail.prev;

    this.tail.prev = node;
    node.prev = prev;

    prev.next = node;
    node.next = this.tail;
  }
  /**
   * 判断节点是否位于链表末尾
   * @param  {Node} node
   * @returns {Boolean}
   */
  isTail(node) {
    return this.tail.prev === node;
  }

  /**
   * 删除链表头部节点
   * @returns {Node|null}
   */
  removeHead() {
    const target = this.head.next;
    return this.remove(target) ? target : null;
  }
}

class LinkedListMap {
  constructor() {
    this.map = new Map();
    this.list = new DoubleLinkedList();
  }

  get size() {
    return this.map.size;
  }

  get(key) {
    return this.map.get(key);
  }

  /**
   * 判断是否有key对应的节点
   * @param {String} key
   * @returns {Boolean}
   */
  has(key) {
    return this.map.has(key);
  }

  /**
   * 将key对应节点调整至链表尾部
   * @param  {String} key
   */
  update(key) {
    const node = this.map.get(key);
    if (!this.list.isTail(node)) {
      this.list.remove(node);
      this.list.addTail(node);
    }
  }

  /**
   * 根据key移除指定节点
   * @param {String} key
   * @returns {Node}
   */
  removeByKey(key) {
    const node = this.map.get(key);
    this.map.delete(key);
    this.list.remove(node);
    return node;
  }

  /**
   * 在链表尾部新增节点
   * @param {String} key
   * @param {Object} value
   */
  addTail(key, value) {
    const node = new Node(key, value);
    this.map.set(key, node);
    this.list.addTail(node);
  }

  /**
   * 移除链表头部节点
   * @returns {Node}
   */
  removeHead() {
    const node = this.list.removeHead();
    this.map.delete(node.key);
    return node;
  }
}

class LRUCache {
  /**
   * @param {Number} [capacity = 5]
   */
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.cache = new LinkedListMap();
  }

  has(key) {
    return this.cache.has(key);
  }

  remove(key) {
    return this.cache.removeByKey(key)
  }

  /**
   * @param  {String} key
   * @returns {Object|null}
   */
  get(key) {
    if (!this.has(key)) {
      return null;
    } else {
      this.cache.update(key);
      return this.cache.get(key).value;
    }
  }

  /**
   * @param  {String} key
   * @param  {Object} value
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.removeByKey(key);
    } else {
      if (this.cache.size === this.capacity) {
        this.cache.removeHead();
      }
    }
    this.cache.addTail(key, value);
  }
}

module.exports = LRUCache;

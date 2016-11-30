/**
 * Copyright (C) 2016 Michael Kourlas
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {IStringOptions, StringOptions} from "../options";
import {isString, isUndefined} from "../utils";
import {validateChar, validateName} from "../validate";
import XmlComment from "./XmlComment";
import XmlDtdAttlist from "./XmlDtdAttlist";
import XmlDtdElement from "./XmlDtdElement";
import XmlDtdEntity from "./XmlDtdEntity";
import XmlDtdNotation from "./XmlDtdNotation";
import XmlDtdParamEntityRef from "./XmlDtdParamEntityRef";
import XmlNode from "./XmlNode";
import XmlProcInst from "./XmlProcInst";

/**
 * Represents an XML document type definition (DTD).
 *
 * An XML document type definition  is structured as follows, where `{name}` is
 * the name of the DTD, `{sysId}` is the system identifier of the DTD,
 * `{pubId}` is the public identifier of the DTD, and `{intSubset}` is the
 * internal subset of the DTD:
 *
 * ```xml
 * <!DOCTYPE {name} SYSTEM "{sysId}" PUBLIC "{pubId}" [
 *     {intSubset}
 * ]>
 * ```
 *
 * The `{name}`, `{pubId}`, and `{sysId}` values are properties of the node,
 * while the `{intSubset}` value consists of the children of this node.
 *
 * XmlDtd nodes can have an unlimited number of {@link XmlComment},
 * {@link XmlDtdAttlist}, {@link XmlDtdElement}, {@link XmlDtdEntity},
 * {@link XmlDtdNotation}, {@link XmlDtdParamEntityRef}, and
 * {@link XmlProcInst} nodes.
 */
export default class XmlDtd extends XmlNode {
    private _name: string;
    private _sysId?: string;
    private _pubId?: string;

    /**
     * Initializes a new instance of the {@link XmlDtd} class.
     *
     * @param name The name of the DTD.
     * @param sysId The system identifier of the DTD, excluding quotation marks.
     * @param pubId The public identifier of the DTD, excluding quotation marks.
     *              If a public identifier is provided, a system identifier
     *              must be provided as well.
     */
    constructor(name: string, sysId?: string, pubId?: string) {
        super();
        this.name = name;
        this.sysId = sysId;
        this.pubId = pubId;
    }

    /**
     * Gets the name of the DTD.
     *
     * @returns The name of the DTD.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Sets the name of the DTD.
     *
     * @param name The name of the DTD.
     */
    set name(name: string) {
        if (!isString(name)) {
            throw new TypeError("name should be a string");
        } else if (!validateName(name)) {
            throw new Error("name should not contain characters not"
                            + " allowed in XML names");
        }
        this._name = name;
    }

    /**
     * Gets the public identifier of the DTD, excluding quotation marks.
     *
     * @returns The public identifier of the DTD, excluding quotation marks.
     *          This value may be undefined.
     */
    get pubId(): string | undefined {
        return this._pubId;
    }

    /**
     * Sets the public identifier of the DTD, excluding quotation marks. If a
     * public identifier is provided, a system identifier must be provided as
     * well.
     *
     * @param pubId The public identifier of the DTD, excluding quotation marks.
     *              This value may be undefined.
     */
    set pubId(pubId: string | undefined) {
        if (isString(pubId)) {
            if (!/^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/
                    .test(pubId))
            {
                throw new Error("pubId should not contain characters not"
                                + " allowed in public identifiers");
            } else if (isUndefined(this.sysId)) {
                throw new Error("pubId should not be defined if sysId is"
                                + " undefined");
            }
        } else if (!isUndefined(pubId)) {
            throw new TypeError("pubId should be a string or undefined");
        }
        this._pubId = pubId;
    }

    /**
     * Gets the system identifier of the DTD, excluding quotation marks.
     *
     * @returns The system identifier of the DTD, excluding quotation marks.
     *          This value may be undefined.
     */
    get sysId(): string | undefined {
        return this._sysId;
    }

    /**
     * Sets the system identifier of the DTD, excluding quotation marks.
     *
     * @param sysId The system identifier of the DTD, excluding quotation marks.
     *              This value may be undefined.
     */
    set sysId(sysId: string | undefined) {
        if (isString(sysId)) {
            if (!validateChar(sysId)) {
                throw new Error("sysId should not contain characters not"
                                + " allowed in XML");
            } else if (sysId.indexOf("'") !== -1 &&
                       sysId.indexOf("\"") !== -1)
            {
                throw new Error("sysId should not contain both single quotes"
                                + " and double quotes");
            }
        } else if (isUndefined(sysId)) {
            if (!isUndefined(this.pubId)) {
                throw new Error("sysId should not be undefined if pubId is"
                                + " defined");
            }
        } else {
            throw new TypeError("sysId should be a string or undefined");
        }
        this._sysId = sysId;
    }

    /**
     * Inserts a new attribute-list declaration at the specified index. If no
     * index is specified, the node is inserted at the end of this node's
     * children.
     *
     * @param text The text of the attribute-list declaration.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this node's
     *              children.
     *
     * @returns The newly created attribute-list declaration.
     */
    public attlist(text: string, index?: number): XmlDtdAttlist {
        const attlist = new XmlDtdAttlist(text);
        this.insertChild(attlist, index);
        return attlist;
    }

    /**
     * Inserts a new comment at the specified index. If no index is specified,
     * the node is inserted at the end of this node's children.
     *
     * @param content The data of the comment.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this node's
     *              children.
     *
     * @returns The newly created comment.
     */
    public comment(content: string, index?: number): XmlComment {
        const comment = new XmlComment(content);
        this.insertChild(comment, index);
        return comment;
    }

    /**
     * Inserts a new element declaration at the specified index. If no index is
     * specified, the node is inserted at the end of this node's children.
     *
     * @param text The text of the element declaration.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this node's
     *              children.
     *
     * @returns The newly created element declaration.
     */
    public element(text: string, index?: number): XmlDtdElement {
        const element = new XmlDtdElement(text);
        this.insertChild(element, index);
        return element;
    }

    /**
     * Inserts a new entity declaration at the specified index. If no index is
     * specified, the node is inserted at the end of this node's children.
     *
     * @param text The text of the entity declaration.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this node's
     *              children.
     *
     * @returns The newly created entity declaration.
     */
    public entity(text: string, index?: number): XmlDtdEntity {
        const entity = new XmlDtdEntity(text);
        this.insertChild(entity, index);
        return entity;
    }

    /**
     * Inserts the specified node into this node's children at the specified
     * index. The node is not inserted if it is already present. If this node
     * already has a parent, it is removed from that parent.
     *
     * Only {@link XmlComment}, {@link XmlDtdAttlist}, {@link XmlDtdElement},
     * {@link XmlDtdEntity}, {@link XmlDtdNotation}, and {@link XmlProcInst}
     * nodes can be inserted; otherwise an exception will be thrown.
     *
     * @param node The node to insert.
     * @param index The index at which to insert the node. Nodes at or after
     *              the index are shifted to the right. If no index is
     *              specified, the node is inserted at the end.
     *
     * @returns The node inserted into this node's children, or undefined if no
     *          node was inserted.
     */
    public insertChild(node: XmlNode, index?: number): XmlNode | undefined {
        if (!(node instanceof XmlComment || node instanceof XmlDtdAttlist ||
              node instanceof XmlDtdElement || node instanceof XmlDtdEntity ||
              node instanceof XmlDtdNotation ||
              node instanceof XmlDtdParamEntityRef ||
              node instanceof XmlProcInst))
        {
            throw new TypeError("node should be an instance of XmlComment,"
                                + " XmlDtdAttlist, XmlDtdElement, XmlDtdEntity,"
                                + " XmlDtdNotation, XmlDtdParamEntityRef, or"
                                + " XmlProcInst");
        }
        return super.insertChild(node, index);
    }

    /**
     * Inserts a new notation declaration at the specified index. If no index is
     * specified, the node is inserted at the end of this node's children.
     *
     * @param text The text of the notation declaration.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this
     *              node's children.
     *
     * @returns The newly created notation declaration.
     */
    public notation(text: string, index?: number): XmlDtdNotation {
        const notation = new XmlDtdNotation(text);
        this.insertChild(notation, index);
        return notation;
    }

    /**
     * Inserts a new parameter entity reference at the specified index. If no
     * index is specified, the node is inserted at the end of this node's
     * children.
     *
     * @param entity The entity to reference.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this
     *              node's children.
     *
     * @returns The newly created parameter entity reference.
     */
    public paramEntityRef(entity: string,
                          index?: number): XmlDtdParamEntityRef
    {
        const paramEntity = new XmlDtdParamEntityRef(entity);
        this.insertChild(paramEntity, index);
        return paramEntity;
    }

    /**
     * Inserts a new processing instruction at the specified index. If no index
     * is specified, the node is inserted at the end of this node's children.
     *
     * @param target The target of the processing instruction.
     * @param content The data of the processing instruction, or undefined if
     *                there is no target.
     * @param index The index at which the node should be inserted. If no index
     *              is specified, the node is inserted at the end of this node's
     *              children.
     *
     * @returns The newly created processing instruction.
     */
    public procInst(target: string, content?: string,
                    index?: number): XmlProcInst
    {
        const procInst = new XmlProcInst(target, content);
        this.insertChild(procInst, index);
        return procInst;
    }

    /**
     * Returns an XML string representation of this node.
     *
     * @param options Formatting options for the string representation.
     *
     * @returns An XML string representation of this node.
     */
    public toString(options: IStringOptions = {}): string {
        const optionsObj = new StringOptions(options);

        let str = "<!DOCTYPE " + this.name;
        if (isUndefined(this.pubId)) {
            if (!isUndefined(this.sysId)) {
                str += " ";
                str = appendId("SYSTEM", this.sysId, str, optionsObj);
            }
        } else {
            str += " ";
            str = appendId("PUBLIC", this.pubId, str, optionsObj);
            str = appendId("", this.sysId!, str, optionsObj);
        }

        if (this._children.length !== 0) {
            str += " [";
            for (const node of this._children) {
                if (optionsObj.pretty) {
                    str += optionsObj.newline + optionsObj.indent;
                }
                str += node.toString(options);
            }
            if (optionsObj.pretty) {
                str += optionsObj.newline;
            }
            str += "]>";
        } else {
            str += ">";
        }

        return str;
    }
}

/**
 * Appends the XML string representation of a public or system identifier to
 * an existing string.
 *
 * @param type "SYSTEM", "PUBLIC", or "".
 * @param value The value of the identifier.
 * @param str The string to which the string representation should be appended.
 * @param options Formatting options for the string representation.
 *
 * @returns The updated string.
 *
 * @private
 */
function appendId(type: string, value: string, str: string,
                  options: StringOptions): string
{
    str += type + " ";
    if (options.doubleQuotes) {
        if (value.indexOf("\"") !== -1) {
            throw new Error("options.doubleQuotes inconsistent with"
                            + " sysId or pubId");
        }
        str += "\"" + value + "\"";
    } else {
        if (value.indexOf("'") !== -1) {
            throw new Error("options.doubleQuotes inconsistent with"
                            + " sysId or pubId");
        }
        str += "'" + value + "'";
    }
    return str;
}

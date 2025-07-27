"use client"
import React, { Fragment } from "react"
import Link from "next/link"

// Import types from central strapi types file
import type { 
  StrapiRichText,
  StrapiRichTextNode, 
  StrapiRichTextMark
} from '@/lib/types/strapi';

// Component props interface
export interface RichTextProps {
  content: StrapiRichText;
  className?: string;
}

export function RichText({ content, className = "" }: RichTextProps) {
  if (!content) return null

  // Add special handling for hero section - inherit text color
  const additionalClasses = className.includes("rich-text-hero") ? "text-inherit" : ""

  return <div className={`${className} ${additionalClasses}`}>{renderContent(content)}</div>
}

function renderContent(content: StrapiRichText): React.ReactNode {
  // Handle null/undefined
  if (content == null) return null

  // Handle string content
  if (typeof content === "string") return content

  // Handle array content
  if (Array.isArray(content)) {
    return content.map((item, index) => (
      <Fragment key={index}>{renderContent(item)}</Fragment>
    ))
  }

  // Handle object content
  if (typeof content === "object") {
    // Check for Strapi rich text structure - sometimes it comes wrapped
    if (content.type === "doc" || content.type === "root") {
      return renderContent(content.content || content.children)
    }

    // Handle individual nodes
    if (content.type) {
      return renderNodeByType(content)
    }

    // Fallback for objects with content property
    if (content.content) {
      return renderContent(content.content)
    }

    // Handle Strapi's nested structure - sometimes content comes as nested objects
    if (content.children) {
      return renderContent(content.children)
    }
  }

  // Fallback
  return String(content)
}

function renderNodeByType(node: StrapiRichTextNode): React.ReactNode {
  // Safety check
  if (!node) return null
  if (!node.type) return renderContent(node.content || node.children)

  switch (node.type) {
    case "doc":
    case "root":
      return renderContent(node.content || node.children)

    case "paragraph":
      return <p>{renderContent(node.content || node.children)}</p>

    case "heading":
      const level = (node.attrs && typeof node.attrs === 'object' && 'level' in node.attrs && typeof node.attrs.level === 'number') 
        ? node.attrs.level 
        : 1;
      const headingContent = renderContent(node.content || node.children)

      // Enhanced heading styles
      if (level === 1) return <h1 className="text-4xl font-bold mb-8 mt-12 text-gray-900 leading-tight">{headingContent}</h1>
      if (level === 2) return <h2 className="text-3xl font-bold mb-6 mt-10 text-gray-900 leading-tight">{headingContent}</h2>
      if (level === 3) return <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-900 leading-tight">{headingContent}</h3>
      if (level === 4) return <h4 className="text-xl font-bold mb-4 mt-6 text-gray-900 leading-tight">{headingContent}</h4>
      if (level === 5) return <h5 className="text-lg font-bold mb-3 mt-4 text-gray-900 leading-tight">{headingContent}</h5>
      return <h6 className="text-base font-bold mb-2 mt-4 text-gray-900 leading-tight">{headingContent}</h6>

    case "text":
      let content: React.ReactNode = node.text || ""

      if (node.bold) {
        content = <strong className="font-bold text-gray-900">{content}</strong>
      }
      
      if (node.italic) {
        content = <em className="italic">{content}</em>
      }
      
      if (node.underline) {
        content = <u className="underline">{content}</u>
      }
      
      if (node.strikethrough) {
        content = <s className="line-through">{content}</s>
      }
      
      if (node.code) {
        content = <code className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono">{content}</code>
      }

      // Also handle the old marks format for backward compatibility
      if (Array.isArray(node.marks) && node.marks.length > 0) {
        content = applyMarks(content, node.marks)
      }

      return content

    case "bullet_list":
    case "list":
      const format = (node.attrs && typeof node.attrs === 'object' && 'format' in node.attrs) ? node.attrs.format : 'unordered';
      if (format === "unordered" || !format) {
        return <ul className="list-disc list-outside pl-6 mb-6 space-y-2">{renderContent(node.content || node.children)}</ul>
      }
      return <ol className="list-decimal list-outside pl-6 mb-6 space-y-2">{renderContent(node.content || node.children)}</ol>

    case "ordered_list":
      return <ol className="list-decimal list-outside pl-6 mb-6 space-y-2">{renderContent(node.content || node.children)}</ol>

    case "list_item":
    case "listItem":
    case "list-item":
      const children = node.content || node.children
      const onlyParagraphs = Array.isArray(children) && children.every((c: StrapiRichTextNode) => c.type === "paragraph")

      return (
        <li className="mb-2 pl-2 text-gray-700 leading-relaxed">
          {onlyParagraphs
            ? children.map((c: StrapiRichTextNode, i: number) => <Fragment key={i}>{renderContent(c.content || c.children)}</Fragment>)
            : renderContent(children)}
        </li>
      )

    case "blockquote":
    case "quote":
      return (
        <blockquote className="border-l-4 border-purple-300 pl-6 py-2 my-8 bg-purple-50 rounded-r-lg">
          <div className="italic text-gray-700 text-lg leading-relaxed">
            {renderContent(node.content || node.children)}
          </div>
        </blockquote>
      )

    case "code_block":
    case "code":
      return (
        <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto mb-6 border">
          <code className="text-sm font-mono">{renderContent(node.content || node.children)}</code>
        </pre>
      )

    case "horizontal_rule":
    case "thematicBreak":
      return <hr className="my-12 border-gray-300" />

    case "image":
      const src = (node.attrs && typeof node.attrs === 'object' && 'src' in node.attrs && typeof node.attrs.src === 'string') ? node.attrs.src : '';
      const alt = (node.attrs && typeof node.attrs === 'object' && 'alt' in node.attrs && typeof node.attrs.alt === 'string') ? node.attrs.alt : '';
      const title = (node.attrs && typeof node.attrs === 'object' && 'title' in node.attrs && typeof node.attrs.title === 'string') ? node.attrs.title : '';

      return (
        <figure className="my-8">
          <img
            src={src}
            alt={alt}
            title={title}
            className="max-w-full rounded-lg shadow-lg mx-auto"
          />
          {alt && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">
              {alt}
            </figcaption>
          )}
        </figure>
      )

    case "hard_break":
    case "break":
      return <br />

    case "link":
      const href = (node.attrs && typeof node.attrs === 'object' && 'href' in node.attrs && typeof node.attrs.href === 'string') ? node.attrs.href : "#";
      const target = (node.attrs && typeof node.attrs === 'object' && 'target' in node.attrs && typeof node.attrs.target === 'string') ? node.attrs.target : undefined;
      const linkContent = renderContent(node.content || node.children)

      if (href.startsWith("http")) {
        return (
          <a
            href={href}
            target={target || "_blank"}
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
          >
            {linkContent}
          </a>
        )
      } else {
        return (
          <Link 
            href={href} 
            className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
          >
            {linkContent}
          </Link>
        )
      }

    default:
      // Try to render the content anyway if possible
      return (node.content || node.children) ? renderContent(node.content || node.children) : null
  }
}

// Keep this for backward compatibility with marks format
function applyMarks(content: React.ReactNode, marks: StrapiRichTextMark[]): React.ReactNode {
  // Safety check
  if (!Array.isArray(marks)) return content

  // Apply marks recursively
  return marks.reduce((result, mark) => {
    if (!mark || !mark.type) return result

    switch (mark.type) {
      case "bold":
      case "strong":
        return <strong className="font-bold text-gray-900">{result}</strong>
      case "italic":
      case "emphasis":
        return <em className="italic">{result}</em>
      case "code":
        return <code className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono">{result}</code>
      case "underline":
        return <u className="underline">{result}</u>
      case "strike":
      case "strikethrough":
        return <s className="line-through">{result}</s>
      case "link":
        const href = mark.attrs?.href || "#"
        if (href.startsWith("http")) {
          return (
            <a
              href={href}
              target={mark.attrs?.target || "_blank"}
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
            >
              {result}
            </a>
          )
        } else {
          return (
            <Link 
              href={href} 
              className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
            >
              {result}
            </Link>
          )
        }
      default:
        return result
    }
  }, content)
}
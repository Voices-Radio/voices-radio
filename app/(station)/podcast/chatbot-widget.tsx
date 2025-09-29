'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Type declaration for the AIChatWidget
declare global {
  interface Window {
    AIChatWidget?: {
      init: (config: { widgetId: string }) => void;
      destroy?: () => void;
    };
  }
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const observerRef = useRef<MutationObserver | null>(null);
  
  useEffect(() => {
    const WIDGET_ID = "6837448e3a642ae3e1d49e94";
    const SCRIPT_SRC = "https://testmyprompt.com/widget/6837448e3a642ae3e1d49e94/widget.js";

    // Function to check if an element is chatbot-related
    const isChatbotElement = (element: Element): boolean => {
      // Never remove critical DOM elements
      const criticalTags = ['HTML', 'HEAD', 'BODY', 'TITLE', 'META', 'LINK'];
      if (criticalTags.includes(element.tagName)) {
        return false;
      }

      const elementId = element.id?.toLowerCase() || '';
      const elementClass = element.className?.toString().toLowerCase() || '';
      const elementSrc = element.getAttribute('src')?.toLowerCase() || '';
      const elementHref = element.getAttribute('href')?.toLowerCase() || '';
      
      // Only check direct attributes, not innerHTML to avoid matching parent containers
      const hasTestMyPrompt = 
        elementId.includes('testmyprompt') ||
        elementId.includes(WIDGET_ID) ||
        elementClass.includes('testmyprompt') ||
        elementClass.includes(WIDGET_ID) ||
        elementSrc.includes('testmyprompt') ||
        elementSrc.includes(WIDGET_ID) ||
        elementHref.includes('testmyprompt') ||
        elementHref.includes(WIDGET_ID);

      // Check for specific chatbot widget patterns
      const isChatWidget = 
        // Specific chatbot container divs
        (element.tagName === 'DIV' && (
          elementId.includes('ai-chat-widget') ||
          elementClass.includes('ai-chat-widget') ||
          elementId.includes('chat-widget') ||
          elementClass.includes('chat-widget')
        )) ||
        // Chatbot iframes
        (element.tagName === 'IFRAME' && (
          elementSrc.includes('testmyprompt') ||
          elementSrc.includes(WIDGET_ID)
        )) ||
        // Only remove scripts that are specifically from testmyprompt
        (element.tagName === 'SCRIPT' && (
          elementSrc.includes('testmyprompt') ||
          elementSrc.includes(WIDGET_ID)
        ));

      return hasTestMyPrompt || isChatWidget;
    };

    // Function to remove chatbot elements
    const removeChatbotElements = () => {
      console.log('🔍 Scanning for chatbot elements to remove...');
      
      // Use more specific selectors instead of querying all elements
      const potentialElements = [
        ...Array.from(document.querySelectorAll('[id*="testmyprompt"], [id*="680b490e84d09aaec30c8bbf"]')),
        ...Array.from(document.querySelectorAll('[class*="testmyprompt"], [class*="680b490e84d09aaec30c8bbf"]')),
        ...Array.from(document.querySelectorAll('[class*="ai-chat-widget"], [id*="ai-chat-widget"]')),
        ...Array.from(document.querySelectorAll('[class*="chat-widget"], [id*="chat-widget"]')),
        ...Array.from(document.querySelectorAll('script[src*="testmyprompt"]')),
        ...Array.from(document.querySelectorAll('iframe[src*="testmyprompt"]'))
      ];
      
      let removedCount = 0;
      
      potentialElements.forEach(element => {
        if (isChatbotElement(element)) {
          console.log('🗑️ Removing chatbot element:', element.tagName, element.id, element.className);
          element.remove();
          removedCount++;
        }
      });
      
      console.log(`✅ Removed ${removedCount} chatbot elements`);
      return removedCount;
    };

    // Function to setup MutationObserver to watch for new elements
    const setupDOMWatcher = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Only observe if document.body exists
      if (!document.body) {
        console.log('❌ Document body not available for observation');
        return;
      }

      observerRef.current = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (isChatbotElement(element)) {
                  console.log('🚫 Blocking new chatbot element:', element.tagName, element.id, element.className);
                  element.remove();
                  shouldCheck = true;
                }
                
                // Also check children of added elements (but be more specific)
                const chatbotChildren = element.querySelectorAll?.(
                  '[id*="testmyprompt"], [id*="6837448e3a642ae3e1d49e94"], [class*="ai-chat-widget"], [id*="ai-chat-widget"]'
                ) || [];
                chatbotChildren.forEach(child => {
                  if (isChatbotElement(child)) {
                    console.log('🚫 Blocking chatbot child element:', child.tagName, child.id, child.className);
                    child.remove();
                    shouldCheck = true;
                  }
                });
              }
            });
          }
        });
        
        if (shouldCheck) {
          // Run a full scan after a short delay to catch any remaining elements
          setTimeout(removeChatbotElements, 100);
        }
      });

      // Start observing
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
      
      console.log('👀 DOM watcher started - monitoring for chatbot elements');
    };

    if (pathname === '/podcast') {
      // Stop watching when on podcast page
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log('👀 DOM watcher stopped - on podcast page');
      }

      // Load and initialize chatbot on podcast page
      const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      
      if (!existingScript) {
        console.log('📦 Loading chatbot script...');
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => {
          console.log('✅ Chatbot script loaded, initializing...');
          if (window.AIChatWidget) {
            window.AIChatWidget.init({ widgetId: WIDGET_ID });
          }
        };
        document.head.appendChild(script);
      } else {
        console.log('🔄 Chatbot script exists, reinitializing...');
        if (window.AIChatWidget) {
          window.AIChatWidget.init({ widgetId: WIDGET_ID });
        }
      }
    } else {
      // Not on podcast page - careful removal and monitoring
      console.log('🧹 Not on podcast page, starting cleanup...');
      
      // 1. Destroy widget if API exists
      if (window.AIChatWidget?.destroy) {
        try {
          window.AIChatWidget.destroy();
          console.log('💥 Widget destroyed via API');
        } catch (e) {
          console.log('❌ Widget destroy failed:', e);
        }
      }

      // 2. Remove all chatbot elements
      removeChatbotElements();

      // 3. Setup DOM watcher to prevent new elements
      setupDOMWatcher();

      // 4. Clear global references
      if (window.AIChatWidget) {
        delete window.AIChatWidget;
        console.log('🗑️ Cleared global AIChatWidget reference');
      }

      // 5. Periodic cleanup (in case observer misses something)
      const cleanupInterval = setInterval(() => {
        const removed = removeChatbotElements();
        if (removed === 0) {
          // If we're not finding anything to remove, we can reduce frequency
          clearInterval(cleanupInterval);
          console.log('✅ Cleanup complete - no more elements found');
        }
      }, 1000);

      // Clear interval after 10 seconds max
      setTimeout(() => {
        clearInterval(cleanupInterval);
        console.log('⏰ Cleanup interval stopped after timeout');
      }, 10000);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pathname]);

  // This component doesn't render anything - it just manages the script
  return null;
} 
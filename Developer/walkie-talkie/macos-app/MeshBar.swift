import Cocoa
import WebKit
import ServiceManagement

// MARK: - App Entry Point
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory) // Menu bar only, no Dock icon
app.run()

// MARK: - App Delegate
class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var popover: NSPopover!
    var webView: WKWebView!
    var eventMonitor: Any?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMenuBarIcon()
        setupPopover()
    }

    func setupMenuBarIcon() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            // Mesh spider web emoji as icon
            button.title = "🕸"
            button.font = NSFont.systemFont(ofSize: 14)
            button.action = #selector(togglePopover)
            button.target = self
        }
    }

    func setupPopover() {
        popover = NSPopover()
        popover.contentSize = NSSize(width: 380, height: 560)
        popover.behavior = .transient
        popover.animates = true

        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.allowsBackForwardNavigationGestures = false

        // Load room from UserDefaults or default to mesh01
        let room = UserDefaults.standard.string(forKey: "mesh_room") ?? "mesh01"
        let name = UserDefaults.standard.string(forKey: "mesh_name") ?? ""
        var urlStr = "https://trymesh.chat/compact?room=\(room)"
        if !name.isEmpty { urlStr += "&name=\(name.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? name)" }
        if let url = URL(string: urlStr) {
            webView.load(URLRequest(url: url))
        }

        let vc = NSViewController()
        vc.view = webView
        popover.contentViewController = vc

        // Close when clicking outside
        eventMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.leftMouseDown, .rightMouseDown]) { [weak self] _ in
            self?.closePopover()
        }
    }

    @objc func togglePopover() {
        if popover.isShown {
            closePopover()
        } else {
            if let button = statusItem.button {
                popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
                popover.contentViewController?.view.window?.makeKey()
            }
        }
    }

    func closePopover() {
        popover.performClose(nil)
    }
}

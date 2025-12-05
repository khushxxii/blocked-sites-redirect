# Browser Extension Setup Guide

This guide explains how to set up browser extensions to redirect blocked websites to your personalized motivation page.

## Recommended Extension: Redirector

Redirector is a free, open-source browser extension that allows you to redirect URLs based on patterns.

### Installation

**Chrome, Edge, Brave, Opera**
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/redirector/ocgpenflpmgnfapjedencafcfakcekcd)
2. Click "Add to Chrome" (or your browser equivalent)
3. Accept the permissions

**Firefox**
1. Visit [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/redirector/)
2. Click "Add to Firefox"
3. Accept the permissions

## Creating Redirect Rules

### Basic Rule Setup

1. Click the Redirector extension icon in your browser toolbar
2. Select "Edit Redirects"
3. Click "Create New Redirect"
4. Fill in the following fields:
   - **Description:** "Block [SiteName]"
   - **Example URLs:** Optional test URL
   - **Include pattern:** `*sitename.com*`
   - **Redirect to:** `http://localhost:3000/blocked?site=sitename`
   - **Pattern type:** Wildcard
   - **Pattern Description:** Optional notes
5. Enable the rule (toggle switch)
6. Save

### Important Notes

- Make sure your Focus Mode app is running (`npm start`) before the redirects will work
- The `?site=` parameter in the redirect URL allows the blocked page to show which site you tried to visit
- Test each redirect by visiting the blocked site

## Example Rules

### YouTube
- **Description:** Block YouTube
- **Include pattern:** `*youtube.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=youtube`
- **Pattern type:** Wildcard

### Netflix
- **Description:** Block Netflix
- **Include pattern:** `*netflix.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=netflix`
- **Pattern type:** Wildcard

### Instagram
- **Description:** Block Instagram
- **Include pattern:** `*instagram.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=instagram`
- **Pattern type:** Wildcard

### Twitter/X
- **Description:** Block Twitter
- **Include pattern:** `*twitter.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=twitter`
- **Pattern type:** Wildcard

### Reddit
- **Description:** Block Reddit
- **Include pattern:** `*reddit.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=reddit`
- **Pattern type:** Wildcard

### TikTok
- **Description:** Block TikTok
- **Include pattern:** `*tiktok.com*`
- **Redirect to:** `http://localhost:3000/blocked?site=tiktok`
- **Pattern type:** Wildcard

## Common Sites to Block

**Social Media**
- Facebook: `*facebook.com*`
- Instagram: `*instagram.com*`
- Twitter/X: `*twitter.com*`
- TikTok: `*tiktok.com*`
- Snapchat: `*snapchat.com*`
- LinkedIn: `*linkedin.com*` (if needed)

**Entertainment**
- YouTube: `*youtube.com*`
- Netflix: `*netflix.com*`
- Hulu: `*hulu.com*`
- Disney+: `*disneyplus.com*`
- Prime Video: `*primevideo.com*`
- Twitch: `*twitch.tv*`

**Gaming**
- Steam: `*steampowered.com*`
- Epic Games: `*epicgames.com*`
- Discord: `*discord.com*`

**News & Reading**
- Reddit: `*reddit.com*`
- Various news sites as needed

**Shopping**
- Amazon: `*amazon.com*`
- eBay: `*ebay.com*`

## Advanced Configuration

### Temporary Disabling

To temporarily disable blocking:
1. Click the Redirector icon
2. Toggle off the specific rule or disable all redirects
3. Re-enable when ready to focus

### Time-Based Blocking

Redirector doesn't natively support time-based rules. For time-based blocking:
1. Enable rules when you start your study session
2. Disable rules when you take breaks or finish
3. Or keep them enabled and use the "override" feature when needed

### Different Redirect Pages

You can create multiple blocked pages if desired:
1. Create `blocked-harsh.html` for aggressive motivation
2. Create `blocked-gentle.html` for gentle reminders
3. Redirect different sites to different pages

## Troubleshooting

**Redirects not working?**
- Check that the Focus Mode server is running (`npm start`)
- Verify the redirect URL is correct (`http://localhost:3000/blocked?site=sitename`)
- Ensure the rule is enabled (toggle is on)
- Check that the include pattern matches the site URL

**Getting redirect loops?**
- Make sure you're not blocking `localhost:3000` itself
- Check that patterns don't overlap

**Port changed?**
- If you changed the port in `server.js`, update all redirect URLs to use the new port
- Example: `http://localhost:3001/blocked?site=youtube`

## Alternative Methods

### Browser Extensions (Alternative)

**Block Site (Chrome/Firefox)**
- Free extension with blocking and redirection features
- Easier UI but less flexible than Redirector

**LeechBlock NG (Chrome/Firefox)**
- More advanced scheduling features
- Steeper learning curve

### Hosts File Method (Advanced)

Not recommended because it doesn't redirect to your motivation page, just blocks access.

## Tips for Effective Blocking

1. **Start Small** - Block 3-5 sites initially, add more as needed
2. **Be Honest** - Block the sites YOU actually waste time on
3. **Read the Page** - When redirected, actually read your motivations
4. **Update Regularly** - Add new time-wasters as they emerge
5. **Customize** - Edit the blocked page HTML to add site-specific messages if desired

## Security Note

Redirector only redirects URLs. It doesn't collect or transmit any data. All your motivations and data stay local on your computer.

---

For more help, see the main [README.md](README.md)

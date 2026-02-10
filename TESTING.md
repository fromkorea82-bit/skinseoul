# Testing Checklist - SkinSEOUL

## Pre-Deployment Testing

### Functionality Tests

- [ ] Landing page loads correctly
- [ ] Navigation works on mobile and desktop
- [ ] Language selector displays (functionality pending)
- [ ] Camera permission request works
- [ ] File upload validates size and type
- [ ] Image preview shows correctly
- [ ] Retake photo works
- [ ] Analysis completes in <10 seconds
- [ ] Results page displays all data
- [ ] Concern cards show correct severity
- [ ] Ingredient recommendations appear
- [ ] Product filtering works
- [ ] Product sorting works
- [ ] Affiliate links open in new tab
- [ ] Back navigation works

### Cross-Browser Testing

- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Chrome (Android)

### Responsive Design

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Analysis time < 10s
- [ ] No console errors

### SEO

- [ ] Meta tags present
- [ ] Open Graph tags work
- [ ] Sitemap accessible
- [ ] robots.txt correct

## User Acceptance Testing

### Test Scenarios

**Scenario 1: First-time user**
1. Land on homepage
2. Click "Analyze My Skin"
3. Grant camera permission
4. Take photo
5. Review results
6. Click ingredient to see products
7. Click affiliate link

**Scenario 2: Upload existing photo**
1. Choose "Upload Photo"
2. Select file from device
3. Confirm analysis
4. Navigate to products

**Scenario 3: Poor quality photo**
1. Upload blurry/dark photo
2. Verify error message
3. Retake with better lighting

## Post-Deployment Monitoring

- [ ] Check Vercel logs for errors
- [ ] Monitor API response times
- [ ] Verify analytics tracking
- [ ] Check affiliate link clicks
- [ ] Monitor OpenAI API usage

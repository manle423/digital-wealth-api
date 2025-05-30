# 📋 Quick Reference - Finance Profile API

## 🚀 TL;DR 

```javascript
// 1. Call API
const response = await fetch('/api/user/me/get-finance-profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Get comprehensive financial data + AI advice
const { data } = await response.json();
const { profile, advice, summary } = data;

// 3. Display beautiful dashboard with charts and AI insights
```

## 📊 What You Get

✅ **Complete Financial Profile**
- User info (age, occupation, risk tolerance)
- Monthly income/expenses/savings
- Total assets, debts, net worth
- Asset & debt breakdown by categories
- Financial health score

✅ **AI-Powered Advice** 
- **Gemini AI analysis** of financial situation
- Personalized recommendations in Vietnamese
- Investment suggestions based on age & risk profile
- Specific action items for improvement

✅ **Rich Data for UI**
- Ready-to-display percentages for charts
- Formatted currency values
- Trend indicators (increasing/decreasing)
- Color-coded health metrics

## 🎨 UI Components You'll Need

### 1. Dashboard Cards
```javascript
// Financial summary cards
<SummaryCard title="Tài sản ròng" value="100,000,000 VND" trend="+15%" />
<SummaryCard title="Điểm sức khỏe" value="75/100" progress={75} />
```

### 2. Charts 
```javascript
// Asset breakdown pie chart
<PieChart data={profile.assets.breakdown} />
// Debt breakdown chart  
<PieChart data={profile.debts.breakdown} />
```

### 3. AI Advice Section
```javascript
// Markdown-formatted AI advice
<div className="ai-advice">
  <ReactMarkdown>{advice.aiGenerated}</ReactMarkdown>
</div>
```

## 📱 Responsive Design

- **Desktop**: 3-column grid layout
- **Tablet**: 2-column layout
- **Mobile**: Single column with stacked cards

## ⚡ Performance Best Practices

### Caching
```javascript
// Cache for 5 minutes
localStorage.setItem(`finance-profile-${userId}`, JSON.stringify(data));
```

### Loading States
```javascript
// Beautiful skeleton loading
{loading && <SkeletonCard />}
{error && <ErrorBoundary onRetry={refetch} />}
```

### Auto Refresh
```javascript
// Refresh every 10 minutes when tab is active
useInterval(() => refetch(), 10 * 60 * 1000);
```

## 🔧 Required Dependencies

```bash
npm install react-markdown chart.js react-chartjs-2 framer-motion
```

## 📝 Sample Integration Steps

1. **Create Hook**: `useFinanceProfile()` 
2. **Build Dashboard**: Cards + Charts + AI Section
3. **Add Loading/Error States**: Skeleton + Error boundary
4. **Implement Caching**: localStorage + TTL
5. **Make Responsive**: Tailwind grid classes
6. **Add Animations**: Framer Motion transitions

## 🚨 Important Notes

- 🟢 **Gemini AI is 100% FREE** - no cost concerns
- 🔐 **JWT token required** for authentication  
- 📊 **Rich financial data** ready for visualization
- 🤖 **AI advice in Vietnamese** - no translation needed
- ⚡ **Fast response times** - typically < 2 seconds
- 🔄 **Auto fallback** if AI service temporarily down

## 📚 Full Documentation

👉 See `docs/frontend-finance-profile-api.md` for complete implementation guide

---

**Need help?** Contact backend team or check browser console for detailed error messages. 
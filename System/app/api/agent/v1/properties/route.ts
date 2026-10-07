import Property from '@/models/Property';
import { authorizeAgent, agentResponse, agentFailure } from '@/lib/agent-api';
import { pagination, propertyQuery } from '@/lib/agent-policy';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const principal = await authorizeAgent(request, 'properties:read');
    const params = new URL(request.url).searchParams;
    const { page, limit } = pagination(params);
    const query = propertyQuery(principal, params);
    const [properties, total] = await Promise.all([
      Property.find(query).select('title purpose propertyType status price pricePeriod areaSize areaUnit bedrooms bathrooms location.city location.country createdAt updatedAt')
        .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Property.countDocuments(query),
    ]);
    return agentResponse({ properties: properties.map(property => ({ ...property, pricePeriod: property.purpose === 'Sale' ? undefined : property.pricePeriod })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return agentFailure(error); }
}

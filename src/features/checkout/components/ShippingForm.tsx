import { useState } from 'react';
import { TextField } from '../../../components/ui/TextField';
import { SelectField } from '../../../components/ui/SelectField';
import type { ShippingAddress } from '../../../types/order';

interface ShippingFormProps {
  onShippingChange: (address: ShippingAddress, method: string) => void;
  initialAddress?: ShippingAddress;
  initialMethod?: string;
}

export function ShippingForm({ onShippingChange, initialAddress, initialMethod = 'standard' }: ShippingFormProps) {
  const [address, setAddress] = useState<ShippingAddress>(
    initialAddress || {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
      phone: '',
    }
  );
  const [method, setMethod] = useState(initialMethod);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);
    onShippingChange(newAddress, method);
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    onShippingChange(address, newMethod);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <TextField
              value={address.fullName}
              onChange={(e) => handleAddressChange('fullName', e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <TextField
              value={address.addressLine1}
              onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
              required
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <TextField
              value={address.addressLine2 || ''}
              onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <TextField
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                required
                placeholder="Lagos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province <span className="text-red-500">*</span>
              </label>
              <TextField
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                required
                placeholder="Lagos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <TextField
                value={address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                required
                placeholder="100001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <SelectField
                value={address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                required
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </SelectField>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <TextField
              type="tel"
              value={address.phone || ''}
              onChange={(e) => handleAddressChange('phone', e.target.value)}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
        
        <div className="space-y-3">
          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={method === 'standard'}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Standard Shipping</p>
                  <p className="text-sm text-gray-600">5-7 business days</p>
                </div>
                <p className="font-semibold text-gray-900">$10.00</p>
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={method === 'express'}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Express Shipping</p>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
                <p className="font-semibold text-gray-900">$25.00</p>
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="radio"
              name="shippingMethod"
              value="international"
              checked={method === 'international'}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">International Shipping</p>
                  <p className="text-sm text-gray-600">10-15 business days</p>
                </div>
                <p className="font-semibold text-gray-900">$50.00</p>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

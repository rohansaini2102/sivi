'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload, RichTextEditor } from '@/components/admin';
import { toast } from 'sonner';

const EXAM_CATEGORIES = ['RAS', 'REET', 'PATWAR', 'POLICE', 'RPSC', 'OTHER'];
const LANGUAGES = [
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'both', label: 'Both' },
];

interface TestSeriesFormData {
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  features: string[];
  isFree: boolean;
  isFeatured: boolean;
  isPublished: boolean;
}

export default function TestSeriesFormPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const testSeriesId = isNew ? null : (params.id as string);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TestSeriesFormData>({
    title: '',
    description: '',
    shortDescription: '',
    thumbnail: '',
    examCategory: 'RAS',
    price: 0,
    discountPrice: undefined,
    validityDays: 180,
    language: 'both',
    features: [''],
    isFree: false,
    isFeatured: false,
    isPublished: false,
  });
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (testSeriesId) {
      fetchTestSeries();
    }
  }, [testSeriesId]);

  const fetchTestSeries = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series/${testSeriesId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        const ts = data.data;
        setFormData({
          title: ts.title,
          description: ts.description,
          shortDescription: ts.shortDescription || '',
          thumbnail: ts.thumbnail || '',
          examCategory: ts.examCategory,
          price: ts.price,
          discountPrice: ts.discountPrice,
          validityDays: ts.validityDays,
          language: ts.language,
          features: ts.features?.length > 0 ? ts.features : [''],
          isFree: ts.isFree,
          isFeatured: ts.isFeatured,
          isPublished: ts.isPublished,
        });
        setSlug(ts.slug);
      } else {
        toast.error('Failed to fetch test series');
        router.push('/admin/content');
      }
    } catch (error) {
      toast.error('Failed to fetch test series');
      router.push('/admin/content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/test-series/${testSeriesId}`;
      const method = isNew ? 'POST' : 'PUT';

      // Clean up features array
      const cleanedFeatures = formData.features.filter((f) => f.trim() !== '');

      // Prepare data object
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        examCategory: formData.examCategory,
        price: formData.price,
        discountPrice: formData.discountPrice,
        validityDays: formData.validityDays,
        language: formData.language,
        features: cleanedFeatures,
        isFree: formData.isFree,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
        thumbnailUrl: formData.thumbnail, // Pre-uploaded URL
      };

      // Create FormData and add data as JSON string
      const submitData = new FormData();
      submitData.append('data', JSON.stringify(dataToSend));

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // NO Content-Type header - browser sets multipart boundary
        },
        body: submitData, // Send FormData, not JSON
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isNew ? 'Test series created successfully' : 'Test series updated successfully');
        router.push('/admin/content?refresh=true');
      } else {
        toast.error(data.error?.message || 'Failed to save test series');
      }
    } catch (error) {
      toast.error('Failed to save test series');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/content')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Create Test Series' : 'Edit Test Series'}
            </h1>
            {slug && (
              <p className="text-sm text-muted-foreground">
                Slug: {slug}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && slug && (
            <Button
              variant="outline"
              className="border-border text-foreground"
              asChild
            >
              <Link href={`/test-series/${slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isNew ? 'Create Test Series' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter test series title"
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-foreground">
                  Short Description
                </Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description (max 300 characters)"
                  maxLength={300}
                  className="bg-background border-border text-foreground resize-none"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.shortDescription.length}/300 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Description *</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter detailed test series description..."
                  minHeight="250px"
                  className="bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Series Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="bg-background border-border text-foreground"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeFeature(index)}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="border-border text-foreground"
              >
                + Add Feature
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                aspectRatio="video"
              />
            </CardContent>
          </Card>

          {/* Category & Language */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Category & Language</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Exam Category *</Label>
                <Select
                  value={formData.examCategory}
                  onValueChange={(value) => setFormData({ ...formData, examCategory: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {EXAM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-foreground">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: 'hi' | 'en' | 'both') =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-foreground">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isFree" className="text-foreground">Free Test Series</Label>
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFree: checked, price: checked ? 0 : formData.price })
                  }
                />
              </div>

              {!formData.isFree && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-foreground">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice" className="text-foreground">
                      Discount Price (₹)
                    </Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      min="0"
                      value={formData.discountPrice || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave empty for no discount"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="validityDays" className="text-foreground">
                  Validity (Days)
                </Label>
                <Input
                  id="validityDays"
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured" className="text-foreground">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublished" className="text-foreground">Published</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unpublished test series won't appear in the store
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

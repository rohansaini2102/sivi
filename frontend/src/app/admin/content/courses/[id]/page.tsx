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
const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  level: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  isFree: boolean;
  isFeatured: boolean;
}

export default function CourseFormPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const courseId = isNew ? null : (params.id as string);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDescription: '',
    thumbnail: '',
    examCategory: 'RAS',
    price: 0,
    discountPrice: undefined,
    validityDays: 365,
    language: 'both',
    level: 'beginner',
    features: [''],
    isFree: false,
    isFeatured: false,
  });
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (data.success) {
        const course = data.data;
        setFormData({
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription || '',
          thumbnail: course.thumbnail || '',
          examCategory: course.examCategory,
          price: course.price,
          discountPrice: course.discountPrice,
          validityDays: course.validityDays,
          language: course.language,
          level: course.level,
          features: course.features?.length > 0 ? course.features : [''],
          isFree: course.isFree,
          isFeatured: course.isFeatured,
        });
        setSlug(course.slug);
      } else {
        toast.error('Failed to fetch course');
        router.push('/admin/content');
      }
    } catch (error) {
      toast.error('Failed to fetch course');
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
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/courses`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/courses/${courseId}`;
      const method = isNew ? 'POST' : 'PUT';

      // Clean up features array
      const cleanedFeatures = formData.features.filter((f) => f.trim() !== '');

      // Prepare form data for multipart/form-data (for thumbnail)
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('examCategory', formData.examCategory);
      submitData.append('price', String(formData.price));
      if (formData.discountPrice !== undefined) {
        submitData.append('discountPrice', String(formData.discountPrice));
      }
      submitData.append('validityDays', String(formData.validityDays));
      submitData.append('language', formData.language);
      submitData.append('level', formData.level);
      submitData.append('features', JSON.stringify(cleanedFeatures));
      submitData.append('isFree', String(formData.isFree));
      submitData.append('isFeatured', String(formData.isFeatured));

      // For thumbnail, we're using the URL directly (already uploaded via ImageUpload)
      if (formData.thumbnail) {
        submitData.append('thumbnailUrl', formData.thumbnail);
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: cleanedFeatures,
          thumbnailUrl: formData.thumbnail,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isNew ? 'Course created successfully' : 'Course updated successfully');
        router.push('/admin/content');
      } else {
        toast.error(data.error?.message || 'Failed to save course');
      }
    } catch (error) {
      toast.error('Failed to save course');
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
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isNew ? 'Create Course' : 'Edit Course'}
            </h1>
            {slug && (
              <p className="text-sm text-slate-400">
                Slug: {slug}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && slug && (
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              asChild
            >
              <Link href={`/courses/${slug}`} target="_blank">
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
            {isNew ? 'Create Course' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="bg-slate-900 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-slate-300">
                  Short Description
                </Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description (max 300 characters)"
                  maxLength={300}
                  className="bg-slate-900 border-slate-700 text-white resize-none"
                  rows={2}
                />
                <p className="text-xs text-slate-500">
                  {formData.shortDescription.length}/300 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Description *</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter detailed course description..."
                  minHeight="250px"
                  className="bg-slate-900 border-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Course Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeFeature(index)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="border-slate-700 text-slate-300"
              >
                + Add Feature
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                aspectRatio="video"
              />
            </CardContent>
          </Card>

          {/* Category & Level */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Category & Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Exam Category *</Label>
                <Select
                  value={formData.examCategory}
                  onValueChange={(value) => setFormData({ ...formData, examCategory: value })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {EXAM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: 'hi' | 'en' | 'both') =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-white">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-white">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isFree" className="text-slate-300">Free Course</Label>
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
                    <Label htmlFor="price" className="text-slate-300">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice" className="text-slate-300">
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
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="validityDays" className="text-slate-300">
                  Validity (Days)
                </Label>
                <Input
                  id="validityDays"
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured" className="text-slate-300">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
